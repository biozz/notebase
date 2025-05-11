# notebase

Notebase is my yet another iteration on the "Everything App". This time I am going for my markdown notes.

There are several key points, why I develop this project:

- I need a mobile-friendly web interface for my notes (Obsidian Web is not good enough, and Obsidian App is too heavy)
- I want a well-established query language, like SQL to work with my notes (Dataview and Datacore are still great, but see previous point)
- I want to replace multiple tools I use for everyday life and I always thought they fit nicely into my markdown notes, just need a better interface (like todo lists, finance goals, tv show tracker, habit tracker, etc.)

I document some of my decisions regarding this project in [docs/adrs](./docs/adrs).

## Development

This project uses [bun](https://bun.sh/). You run it with `bun dev` and follow instructions in the terminal.

There is an `example/` directory with a bunch of notes and a config file.

If you feel ambitious after thoroughly inspecting the source code, you can do `NOTES_ROOT=/abs/path/to/your/vault bun dev` and try it on the real data. :)

And if you do, don't forget to add `.notebase.yml` to your root. You can check out an example config in [/examples/biozz_notebase_config.yml](./examples/biozz_notebase_config.yml).

## Contributing

I might be interested in some contributions, but because it is an experimental project, I would prefer discussions and maybe code-reviews of the non-optimal or non-conventional parts of the codebase.
