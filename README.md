# OpenCloth.ts

**This is a web based port of some examples from the [OpenCloth][open_cloth] library.**

The changes in this port includes:
* Works in web browsers that supports WebGL technology
* Forms to easily edit the simulation configuration
* Rewritten to object oriented approach

The repository contains examples for two simulation methods:
* Mass-Spring System (Explicit Euler)
* Position Based Dynamics

Features missing:
* Moving and rotating the camera
* Mouse interaction with simulated cloth

## Purpose

This project was written as a part of my master’s thesis titled:

_Implementation of cloth simulation algorithms_

Code in this repository is **not state of the art** but it does its job.

## Live online demos

* [Mass-Spring System][mss_demo]
* [Position Based Dynamics][pbd_demo]

## How to run it locally?

1. Clone the repository
2. Install the [Bower package manager][bower]
3. Install the [TSD manager][tsd]
4. In project directory run ```bower install```
5. In the same directory run ```tsd install```
6. Open the `mss.html` or `pbd.html` file in a web browser

## License

Copyright (c) 2015 Marcin Gajda. [MIT license][mit] applies.

[open_cloth]: https://github.com/mmmovania/opencloth
[bower]: https://bower.io/#install-bower
[tsd]: https://github.com/DefinitelyTyped/tsd
[mss_demo]: http://marcingajda.pl/projects/opencloth.ts/opencloth.ts/mss.html
[pbd_demo]: http://marcingajda.pl/projects/opencloth.ts/opencloth.ts/pbd.html
[mit]: http://opensource.org/licenses/mit-license.php
