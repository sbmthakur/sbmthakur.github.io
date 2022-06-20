---
title: Consuming Podman events
description: This is a post on My Blog about agile frameworks.
date: 2018-05-01
layout: layouts/post.njk
---

Recently I had a use-case where I had to trigger a certain action after a specific sequence of events. I had no idea how long the sequence will take. I thought of scheduling this action on a separate thread after sometime. However, after a few tests it became clear that this approach is not fault tolerant. To my luck, this entire sequence ran in a container which is stopped once the sequence ends. It became clear that [Podman events](https://github.com/containers/podman/blob/main/docs/source/markdown/podman-events.1.md) can come handy here.

For my use-case, I am only interested in the `stop` events. This can be easily done by passing a _filter_ to the `podman events` command.

```bash
$ podman events --filter="event=stop"
2022-06-19 16:28:04.905386281 -0500 CDT container stop af9066a8e482dcfac4a4a3528f54a10610d0bf03613a720c494c8ec5b21eca91 (image=docker.io/library/python:latest, name=focused_proskuriakova)
```

These events are also exposed through [Podman v2.0 RESTful API](https://docs.podman.io/en/v3.2.3/_static/api.html). The folks who manage Podman have provided [Python bindings](https://github.com/containers/podman-py) to use this API. Before using the library we need to enable the Podman socket which allows us to use the API[1].

```bash
$ systemctl enable --now podman.socket
```

Once enabled, we can connect to the Podman's socket and start looking for events. Note the `filters` parameter to `client.events` function. This is the same filter that we had passed to the `podman events` command in the previous section. 

```python
import os
from podman import PodmanClient

uid = os.getuid()
uri = f"unix:///run/user/{uid}/podman/podman.sock"

with PodmanClient(base_url=uri) as client:
    event_generator = client.events(
        decode=True, 
        filters={ 'event': 'stop' }
        )

    for e in event_generator:
        container_name = e['Actor']['Attributes']['name']
        print(container_name)
```

We can name the script as `events.py`. To test it out, we can run a couple of containers in *detached* mode and **stop** them with podman. The script will print the container names if it's running correctly.

```bash
$ podman run --name http_server -d docker.io/httpd
$ podman run --name my_redis -d docker.io/redis
```

We can start looking for the events by running `events.py`:

```bash
$ python events.py
  
```

We can issue the stop commands in another terminal:

```bash
$ podman stop http_server my_redis
```

Check output of `events.py` and we should see the same container names over there.

```bash
$ python events.py 
http_server
my_redis
```

### References:

1. [Using the container-tools API](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/building_running_and_managing_containers/assembly_using-the-container-tools-api_building-running-and-managing-containers)