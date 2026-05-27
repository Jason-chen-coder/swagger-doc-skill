# swagger-doc-skill

[中文文档](README.md) | English

`swagger-doc-skill` helps Codex read Swagger/OpenAPI documentation. Give it a Swagger UI, Knife4j, Redoc, FastAPI docs, OpenAPI JSON/YAML URL, or local spec file, and it can help you find APIs, understand request/response fields, inspect type definitions, and export complete API documentation.

It is useful when you want to ask Codex questions like "which API should I use for login?" instead of manually searching through a large Swagger page.

## What It Can Do

- Discover the real OpenAPI spec behind Swagger UI, Knife4j, Redoc, FastAPI docs, and `swagger-resources`.
- List modules/tags, endpoints, and endpoint summaries.
- Search endpoints by feature intent, including common Chinese/English terms such as login/auth/token, task/run/job, and device/equipment/instrument.
- Show request parameters, request bodies, response schemas, and reusable DTO/schema definitions.
- Generate integration guidance with request URL, auth notes, `curl`, and JavaScript `fetch` examples.
- Export complete API documentation to Markdown or JSON.
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

> Install this skill from GitHub:
>
> https://github.com/Jason-chen-coder/swagger-doc-skill/tree/main/swagger-doc-skill

After installation, restart Codex so the new skill is picked up.

### Option 2: Install Manually

Copy the `swagger-doc-skill/` folder into your Codex skills directory:

> `~/.codex/skills/swagger-doc-skill`

Then restart Codex.

## Quick Start

Use it in chat. You usually do not need to run the script manually.

### List Modules

> User:
>
> This Swagger URL is `http://host/doc#/`. Please show me the available modules.
>
> Codex:
>
> I will use `swagger-doc-skill` to read the docs and return the module/tag list.

### Find APIs For A Feature

> User:
>
> I want to integrate login. The Swagger URL is `http://host/doc#/`. Please find the matching API.
>
> Codex:
>
> I will search with login/auth/token-related keywords. If there is one clear endpoint, I will show the integration guide. If multiple endpoints match, I will ask you to choose.

### Inspect One Endpoint

> User:
>
> Please explain how to call `POST /api/user/login` and what the response fields mean.
>
> Codex:
>
> I will return the method, URL, auth method, headers, path/query/body parameters, response schema, and call examples.

### Export Full Docs

> User:
>
> Export the complete Swagger API documentation to a Markdown file named `swagger-api.md`.
>
> Codex:
>
> I will export modules, endpoints, request/response details, and reusable type definitions to the Markdown file.

### No Swagger URL Yet

> User:
>
> Help me integrate the login API.
>
> Codex:
>
> Please provide a Swagger docs URL, OpenAPI JSON/YAML URL, or `swagger.config.json` config file path.

## Multiple Chats And Projects

`swagger-doc-skill` does not save a Swagger URL from one chat as a global default.

- A Swagger URL confirmed in chat A is only context for follow-up questions in chat A.
- Chat B can confirm a different Swagger URL and will not automatically inherit chat A's source.
- If one chat contains multiple Swagger URLs, Codex should ask which one to use before querying.
- When Codex answers an API query, it should state the active Swagger source.
- Avoid putting business project URLs into a shared config file inside the skill directory.

## Optional Config

If you often query the same API documentation, create a project-level `swagger.config.json` from `swagger.config.example.json` inside the skill folder. It can store the docs URL, auth token, custom headers, and cache path.

Use the config explicitly in chat, for example:

> This project uses `./swagger.config.json` as the Swagger config.

Keep private tokens in your local config file. Do not commit `swagger.config.json`. The script no longer reads a shared `swagger.config.json` from the skill directory automatically, which avoids mixing Swagger sources across chats or projects.

## Output Style

For Chinese requests, the skill should answer in Chinese with concise sections such as:

- 模块列表
- 接口列表
- 请求说明
- 响应说明
- 类型定义
- 对接示例

The skill should not invent endpoints. Every answer should come from the Swagger/OpenAPI document that was provided or configured.
