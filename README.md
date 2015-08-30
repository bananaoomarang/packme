# Packme - The Pluggable Package Manager

![Oh my oh me](examples/lodash.gif)

## The problem

There's a lot of package managers, and that kind of sucks. My system, for instance, is a soup of packages installed by Pacman, NPM, Cargo, Pip, RubyGems etc etc, but all of these programs achieve the same thing: they expand a set of files over my filesystem, keep track of where they are and do the same for dependencies. If we could all agree on one standard this problem would be solved, but there's an issue.

![Oh, oh dear](http://imgs.xkcd.com/comics/standards.png)

Every time someone creates 'one package format to rule them all and in the darkness bind them' we end up with another standard and, however great the marketting, limited adoption.

## Yeah, so... You're doing it again?

Not quite. In a sense, Packme *does* define a new package format, but one with a twist: it *never* intends to be used for installing a package. Packme defines a transitionary format, used as a common base for plugins to work from, without knowing about eachother.

In practice this means that Developer X can write a plugin for Ubuntu Debs which exports two functions, an `in` and an `out`, one of which reads from a `.deb` archive, translating it to the packme format, and one of which writes from the packme format to a `.deb` archive.

Then this degree of separation means that Developer Y, completely unaware of the Ubuntu Deb format, is able to write another plugin, let's say for an NPM package, automatically interoperable with Developer X's Ubuntu plugin.

Hopefully this will make deployments and personal installations between package formats more sane.
