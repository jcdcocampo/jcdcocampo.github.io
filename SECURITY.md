# Security policy

## Reporting a vulnerability

Please report suspected vulnerabilities privately to `jcdcocampo@gmail.com`. Include the affected page or component and steps to reproduce. Do not publish credentials, private messages, or personal data in an issue.

## Deployment notes

This repository contains a static browser app. Anything shipped from `src/` or `public/` is visible to visitors and must not contain secrets. The Mian chatbot backend is hosted separately; API credentials, request validation, rate limits, and data-retention controls must be configured there, not in this repository.
