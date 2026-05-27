# swagger-doc-skill

Codex skill for querying Swagger/OpenAPI documentation, finding endpoints, inspecting schema definitions, exporting API documentation, and generating endpoint integration guides.

## Features

- Discover OpenAPI specs from Swagger UI, Knife4j, Redoc, FastAPI docs, direct JSON/YAML URLs, and `swagger-resources`.
- List modules/tags, endpoints, reusable schemas, and full request/response details.
- Export complete API documentation to Markdown or JSON.
- Generate integration guidance with request URL, auth notes, request/response schemas, `curl`, and JavaScript `fetch` examples.
- Use a local spec cache for unstable or slow docs servers.

## Quick Start

```bash
node swagger-doc-skill/scripts/extract_swagger_docs.mjs "http://host/doc#/" --mode modules
node swagger-doc-skill/scripts/extract_swagger_docs.mjs "http://host/doc#/" --mode endpoints --search "登录"
node swagger-doc-skill/scripts/extract_swagger_docs.mjs "http://host/doc#/" --mode integration --search "登录"
node swagger-doc-skill/scripts/extract_swagger_docs.mjs "http://host/doc#/" --mode document --output swagger-api.md
```

## Skill

Install or copy the `swagger-doc-skill/` directory into your Codex skills directory.
