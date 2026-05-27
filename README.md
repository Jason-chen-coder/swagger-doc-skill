# swagger-doc-skill

默认中文文档 | [English](README.en.md)

`swagger-doc-skill` 是一个帮助 Codex 阅读 Swagger/OpenAPI 文档的 skill。你可以给它一个 Swagger UI、Knife4j、Redoc、FastAPI docs、OpenAPI JSON/YAML 地址，或者本地 spec 文件，它会帮你查询模块、查找接口、理解请求/响应字段、查看类型定义，并导出完整接口文档。

它适合用在这种场景：你不想自己在很大的 Swagger 页面里来回搜索，而是希望直接问 Codex：“我要对接登录功能，应该用哪个接口？”

## 它能做什么

- 自动发现 Swagger UI、Knife4j、Redoc、FastAPI docs 和 `swagger-resources` 背后的真实 OpenAPI 文档。
- 查询模块/tag、接口列表和接口摘要。
- 按功能意图查接口，支持常见中英文关键词，例如登录/auth/token、任务/run/job、设备/device/instrument。
- 查看完整请求参数、请求体、响应结构和可复用 DTO/schema 类型定义。
- 生成接口对接说明，包括请求 URL、鉴权说明、`curl` 示例和 JavaScript `fetch` 示例。
- 导出完整 API 文档为 Markdown 或 JSON。
- 在接口文档服务不稳定时使用本地缓存。

## 环境要求

- Codex 支持自定义 skills。
- Codex 运行环境里可以使用 Node.js。
- 不需要 Python 环境。
- 普通 Swagger UI 或 OpenAPI JSON 场景不需要执行 `npm install`。
- 直接解析 YAML spec 是可选能力，可能需要 `yaml` npm 包。如果 YAML 解析不可用，建议使用 OpenAPI JSON 地址或导出的 JSON 文件。

## 安装方式

### 方式一：让 Codex 从 GitHub 安装

在 Codex 里说：

> 请从 GitHub 安装这个 skill：
>
> https://github.com/Jason-chen-coder/swagger-doc-skill/tree/main/swagger-doc-skill

安装完成后，重启 Codex，让新 skill 生效。

### 方式二：手动安装

把仓库里的 `swagger-doc-skill/` 文件夹复制到你的 Codex skills 目录：

> `~/.codex/skills/swagger-doc-skill`

然后重启 Codex。

## 快速开始

直接在聊天里使用即可。大多数情况下，你不需要手动运行脚本。

### 查看模块列表

> User:
>
> 这个 Swagger 地址是 `http://host/doc#/`，帮我看一下有哪些模块。
>
> Codex:
>
> 我会使用 `swagger-doc-skill` 读取文档，并返回模块/tag 列表。

### 按功能查接口

> User:
>
> 我要对接登录功能，Swagger 地址是 `http://host/doc#/`，帮我找对应接口。
>
> Codex:
>
> 我会用登录、auth、token 等关键词查找候选接口。如果只命中一个明确接口，会直接给出对接说明；如果命中多个接口，会先让你选择。

### 查看单个接口

> User:
>
> 帮我看一下 `POST /api/user/login` 怎么请求，响应字段是什么。
>
> Codex:
>
> 我会返回 method、URL、鉴权方式、请求头、path/query/body 参数、响应结构和调用示例。

### 导出完整文档

> User:
>
> 把这个 Swagger 的完整接口文档导出成 Markdown 文件，文件名叫 `swagger-api.md`。
>
> Codex:
>
> 我会把模块、接口、请求/响应说明和可复用类型定义导出到 Markdown 文件。

### 没有提供 Swagger 地址时

> User:
>
> 帮我查一下登录接口怎么对接。
>
> Codex:
>
> 请提供 Swagger 文档地址、OpenAPI JSON/YAML 地址，或 `swagger.config.json` 配置文件路径。

## 多会话和多项目

`swagger-doc-skill` 不会把某个会话里的 Swagger 地址保存成全局默认地址。

- A 会话里确认的 Swagger 地址，只在 A 会话里作为后续问题的上下文。
- B 会话里可以确认另一个 Swagger 地址，不会自动继承 A 会话的地址。
- 如果同一个会话里出现多个 Swagger 地址，Codex 应该先确认你要查哪一个。
- 每次回答接口查询结果时，Codex 应该明确说明当前使用的 Swagger 文档来源。
- 不建议把业务项目地址写进 skill 目录里的共享配置文件。

## 可选配置

如果你经常查询同一个接口文档，可以基于 skill 目录里的 `swagger.config.example.json` 创建项目级 `swagger.config.json`。它可以保存文档地址、鉴权 token、自定义请求头和缓存路径。

配置文件需要显式指定使用，例如在聊天里说：

> 这个项目使用 `./swagger.config.json` 作为 Swagger 配置。

请把私有 token 留在本地配置文件里，不要提交 `swagger.config.json`。脚本不会再自动读取 skill 目录里的共享 `swagger.config.json`，这样可以避免多会话或多项目串用同一个 Swagger 地址。

## 输出风格

中文请求默认用中文回答，并尽量使用这些简洁结构：

- 模块列表
- 接口列表
- 请求说明
- 响应说明
- 类型定义
- 对接示例

这个 skill 不会编造接口。所有回答都应该来自你提供或配置的 Swagger/OpenAPI 文档。
