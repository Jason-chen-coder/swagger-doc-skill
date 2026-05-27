---
name: swagger-doc-skill
description: Query, extract, and summarize online Swagger/OpenAPI documentation into module lists, endpoint lists, complete reusable type definitions, request/response explanations, and full Markdown or JSON API exports. Use when Codex is given a Swagger UI, Knife4j, FastAPI docs, Redoc, OpenAPI JSON/YAML, or Swagger 2.0 URL and needs to answer questions about modules/tags, interfaces/endpoints, schemas/models/DTOs, request or response fields, or export all interface definitions to a Markdown file.
---

# Swagger Doc Skill

## Overview

Use this skill to query or export online Swagger/OpenAPI documentation. Prefer the bundled Node.js script for extraction so endpoint discovery, embedded `swaggerDoc` parsing, `$ref` resolution, server/auth extraction, request-body parsing, response-schema formatting, integration examples, and reusable type-definition rendering stay consistent.

## Runtime Requirements

Run the bundled script with Node.js. It is a single `.mjs` file and uses only Node built-in APIs for JSON/OpenAPI and Swagger UI pages, so users do not need Python or npm install for normal Swagger UI / OpenAPI JSON workflows.

YAML specs are optional: if the input is a direct `.yaml` or `.yml` OpenAPI file, the script tries to load the optional npm package `yaml`. If that package is unavailable, ask the user for the JSON spec URL or exported JSON file.

## Workflow

1. Map the user's intent to a script mode: `modules`, `endpoints`, `integration`, `types`, or `document`.
2. Resolve the Swagger document source before running any command.
3. Run `scripts/extract_swagger_docs.mjs` with Node.js and the resolved docs URL or config path, resolving the script path relative to this `SKILL.md`.
4. If the URL is a UI page, let the script discover the backing OpenAPI/Swagger spec from page config, embedded `swaggerDoc`, common spec paths, or `swagger-resources`.
5. Review the generated Markdown or JSON for module count, endpoint count, type count, base URLs, security schemes, missing summaries, and unresolved schemas.
6. If discovery fails, inspect the page network/config manually and rerun the script with the direct OpenAPI JSON/YAML URL.
7. Present the output in the user's requested language and shape. For Chinese requests, use concise headings such as `模块列表`, `接口列表`, `请求说明`, `响应说明`, and `类型定义`.

## Document Source

Before using this skill, determine where the Swagger/OpenAPI document is:

1. If the user provided a docs URL, OpenAPI JSON/YAML URL, local spec file, or config path, use it.
2. If `swagger-doc-skill/swagger.config.json` exists in the skill folder and the user has not provided another source, use `--config swagger-doc-skill/swagger.config.json`.
3. If no docs URL, local spec file, or usable config is available, ask one short question before running tools:

```text
请提供 Swagger 文档地址、OpenAPI JSON/YAML 地址，或 swagger.config.json 配置文件路径。
```

Do not guess an API documentation URL, scan unrelated hosts, or invent endpoints when no source is available.

## Feature Integration Lookup

When the user says they want to integrate a feature, such as "我要对接登录功能" or "帮我找创建任务接口", use the docs source and search for endpoint candidates first. `--search` includes a small Chinese/English synonym map for common intents such as login/auth/token, task/run/job, device/equipment/instrument, create/list/update/delete, upload/download:

```bash
node swagger-doc-skill/scripts/extract_swagger_docs.mjs --config swagger-doc-skill/swagger.config.json --mode endpoints --search "登录"
```

Then:

- If exactly one endpoint is a clear match, generate the handoff with `--mode integration --path "<path>" --method <METHOD>`.
- If multiple endpoints match, show a concise candidate list with method, path, tag, and summary, then ask the user to choose.
- If no endpoints match, try 2-4 adjacent keywords from the user's wording and the likely API vocabulary, such as `登录`, `token`, `auth`, `用户`, or an English equivalent when relevant.
- Do not produce integration instructions until an actual endpoint is identified from the spec.

The integration output includes request URL, auth notes from `securitySchemes`, request/response details, a `curl` example, and a JavaScript `fetch` example.

## Quick Commands

Use a config file when the user repeatedly queries the same Swagger service:

```bash
cp swagger-doc-skill/swagger.config.example.json swagger-doc-skill/swagger.config.json
node swagger-doc-skill/scripts/extract_swagger_docs.mjs --config swagger-doc-skill/swagger.config.json --mode modules
```

Use a local cache for repeated queries or unstable docs servers:

```bash
node swagger-doc-skill/scripts/extract_swagger_docs.mjs "http://host/doc#/" --cache swagger-spec-cache.json --mode modules
node swagger-doc-skill/scripts/extract_swagger_docs.mjs "http://host/doc#/" --cache swagger-spec-cache.json --refresh-cache --mode modules
```

Export the complete Markdown API document:

```bash
node swagger-doc-skill/scripts/extract_swagger_docs.mjs "http://host/doc#/" --mode document --output swagger-api.md
```

List modules/tags:

```bash
node swagger-doc-skill/scripts/extract_swagger_docs.mjs "http://host/doc#/" --mode modules
```

List endpoints, optionally filtered by module/tag:

```bash
node swagger-doc-skill/scripts/extract_swagger_docs.mjs "http://host/doc#/" --mode endpoints --tag "用户管理"
```

Show endpoint request/response details for a path or keyword:

```bash
node swagger-doc-skill/scripts/extract_swagger_docs.mjs "http://host/doc#/" --mode endpoints --details --path "/v1/runs"
```

Query one exact API, similar to `getApi <path> <method>`:

```bash
node swagger-doc-skill/scripts/extract_swagger_docs.mjs "http://host/doc#/" --mode endpoint --path "/api/user/list" --method GET
```

Generate interface integration guidance for a feature or exact endpoint:

```bash
node swagger-doc-skill/scripts/extract_swagger_docs.mjs "http://host/doc#/" --mode integration --search "登录"
node swagger-doc-skill/scripts/extract_swagger_docs.mjs "http://host/doc#/" --mode integration --path "/api/user/login" --method POST
```

Show complete reusable type definitions:

```bash
node swagger-doc-skill/scripts/extract_swagger_docs.mjs "http://host/doc#/" --mode types
```

Filter type definitions by schema/model/DTO name:

```bash
node swagger-doc-skill/scripts/extract_swagger_docs.mjs "http://host/doc#/" --mode types --type "CreateRun"
```

Generate structured JSON:

```bash
node swagger-doc-skill/scripts/extract_swagger_docs.mjs "http://host/doc#/" --mode document --format json --output swagger-api.json
```

Pass auth or custom headers:

```bash
node swagger-doc-skill/scripts/extract_swagger_docs.mjs "https://host/docs" \
  --header "Authorization: Bearer TOKEN" \
  --header "X-Tenant-Id: demo" \
  --output swagger-api.md
```

Use `--verbose` when discovery fails so attempted spec URLs are visible.

When `--output` is used and parsing succeeds, the script prints a short success summary with output path, mode, format, source count, module count, endpoint count, and type count. Without `--output`, stdout remains the requested Markdown or JSON body.

## Output Expectations

Full `document` Markdown output should include:

- API title, version, source URL, and endpoint count.
- Base URLs from OpenAPI `servers` or Swagger 2 `host`/`basePath` when documented.
- Security schemes from OpenAPI `components.securitySchemes` or Swagger 2 `securityDefinitions` when documented.
- A module/tag list with endpoint and method counts.
- A compact endpoint index grouped by module/tag.
- One section per endpoint with method, path, summary, operation ID, request parameters, request body content types, response status codes, descriptions, and schemas.
- A type-definition section for reusable schemas/models/DTOs.
- Required fields marked with `required`.
- Deprecated endpoints skipped by default unless `--include-deprecated` is used.

`integration` Markdown output should include:

- One section per matched endpoint.
- Full request URL built from the first documented base URL plus the path.
- Auth requirements and sample auth headers when security schemes are documented.
- Request parameters/body and response schema.
- `curl` and JavaScript `fetch` examples with sample body values inferred from schemas.

Query modes should be used this way:

- `--mode modules`: answer "有哪些模块/tag/控制器"; use this for `getModules`.
- `--mode endpoints`: answer "有哪些接口"; use this for `getApis <module>` with `--tag`, and add `--method`, `--path`, or `--search` when the user narrows the question.
- `--mode endpoint`: answer "这个接口怎么请求/返回什么"; use this for `getApi <path> <method>` with `--path` and `--method`.
- `--mode integration`: answer "我要对接某个功能/接口"; use this only after a real endpoint has been matched or selected.
- `--mode types`: answer "有哪些类型定义/DTO/schema"; add `--type` or `--search` for a specific model.
- `--mode document --output <file.md>`: export the complete API document to Markdown.

For detailed formatting conventions and troubleshooting notes, read `references/output-format.md` only when the default output needs adjustment.

## Failure Handling

- If the docs page responds but the script cannot find a spec URL, search the HTML or bundled JavaScript for `url`, `urls`, `configUrl`, `spec-url`, `openapi`, `swagger.json`, `api-docs`, or `swagger-resources`.
- If the user-provided docs URL itself times out or returns a fetch error, stop and report that error directly instead of trying many fallback paths.
- If the docs server requires login, ask the user for an exported JSON/YAML spec or a safe auth header.
- If the server is reachable but returns no HTTP bytes or times out, report that network behavior directly and leave the command ready for the user's reachable environment.
- Support older Swagger generator schemas that use `originalRef` instead of `$ref`; both should resolve to full schema details when available.
- Do not invent endpoints. Only summarize endpoints present in the fetched spec.
