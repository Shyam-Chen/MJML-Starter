# Email Starter

:e-mail: A boilerplate for building responsive HTML emails.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Pnpm](https://pnpm.js.org/)

## Usage

1. Clone this repository and install its dependencies

```sh
$ git clone https://github.com/Shyam-Chen/Email-Starter email-template-builder
$ cd email-template-builder
$ pnpm install
```

2. Start a development server

Transpiles: `posthtml` -> Data (`yaml`) + `nunjucks` -> `mjml` -> `html`

```sh
$ pnpm serve
```

3. Build templates

Transpiles: `posthtml` -> `mjml` -> `html` (`nunjucks` ready)

```sh
$ pnpm build
```

4. Move templates

```sh
$ pnpm move --to=../path/to/src/templates
```
