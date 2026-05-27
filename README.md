# swagger-doc-skill

`swagger-doc-skill` helps Codex read Swagger/OpenAPI documentation for you. Give it a Swagger UI, Knife4j, Redoc, FastAPI docs, OpenAPI JSON/YAML URL, or local spec file, and it can help you find APIs, understand request/response fields, inspect type definitions, and export a complete Markdown API document.

It is useful when you want to ask questions like "which API should I use for login?" instead of manually searching through a large Swagger page.

## What It Can Do

- Find the real OpenAPI spec behind Swagger UI, Knife4j, Redoc, FastAPI docs, and `swagger-resources`.
- List modules/tags and endpoint summaries.
- Search endpoints by feature intent, including common Chinese/English terms such as login/auth/token, task/run/job, and device/equipment/instrument.
- Show full request parameters, request bodies, response schemas, and reusable DTO/schema definitions.
- Generate integration guidance with request URL, auth notes, `curl`, and JavaScript `fetch` examples.
- Export the whole API document to Markdown or JSON.
- Use a local cache when the docs service is slow or unstable.

## Requirements

- Codex with custom skills enabled.
- Node.js available in the environment where Codex runs the bundled script.
- No Python environment is required.
- No npm install is required for normal Swagger UI or OpenAPI JSON usage.
- Direct YAML specs are optional and may require the `yaml` npm package. If YAML parsing is unavailable, use the OpenAPI JSON URL or exported JSON file instead.

## Install The Skill

### Option 1: Ask Codex To Install It

In Codex, say:

> 请从 GitHub 安装这个 skill：
>
> https://github.com/Jason-chen-coder/swagger-doc-skill/tree/main/swagger-doc-skill

After installation, restart Codex so the new skill is picked up.

### Option 2: Install Manually

Copy the `swagger-doc-skill/` folder into your Codex skills directory:

> `~/.codex/skills/swagger-doc-skill`

Then restart Codex.

## Quick Start

Use it in chat. You usually do not need to run the script manually.

### List modules

> User:
>
> 这个 Swagger 地址是 `http://host/doc#/`，帮我看一下有哪些模块。
>
> Codex:
>
> 我会使用 `swagger-doc-skill` 读取文档，并返回模块/tag 列表。

### Find APIs for a feature

> User:
>
> 我要对接登录功能，Swagger 地址是 `http://host/doc#/`，帮我找对应接口。
>
> Codex:
>
> 我会用登录、auth、token 等关键词查找候选接口。如果只命中一个明确接口，会直接给出对接说明；如果命中多个接口，会先让你选择。

### Inspect one endpoint

> User:
>
> 帮我看一下 `POST /api/user/login` 怎么请求，响应字段是什么。
>
> Codex:
>
> 我会返回 method、URL、鉴权方式、请求头、path/query/body 参数、响应结构和调用示例。

### Export full docs

> User:
>
> 把这个 Swagger 的完整接口文档导出成 Markdown 文件，文件名叫 `swagger-api.md`。
>
> Codex:
>
> 我会把模块、接口、请求/响应说明和可复用类型定义导出到 Markdown 文件。

### No Swagger URL yet

> User:
>
> 帮我查一下登录接口怎么对接。
>
> Codex:
>
> 请提供 Swagger 文档地址、OpenAPI JSON/YAML 地址，或 `swagger.config.json` 配置文件路径。

## Optional Config

If you often query the same API documentation, create a `swagger.config.json` file from `swagger.config.example.json` inside the skill folder. It can store the docs URL, auth token, custom headers, and cache path.

Keep private tokens in your local config file. Do not commit `swagger.config.json`.

## Output Style

For Chinese requests, the skill should answer in Chinese with concise sections such as:

- 模块列表
- 接口列表
- 请求说明
- 响应说明
- 类型定义
- 对接示例

It should not invent endpoints. Every answer should come from the Swagger/OpenAPI document that was provided or configured.
