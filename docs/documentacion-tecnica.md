# Documentacion tecnica - Laboratorio CI/CD

## 1. Objetivo

Definir dos pipelines para una aplicacion web alojada en GitHub.

El primero implementa **Integracion Continua (CI)** con GitHub Actions. El segundo define **Entrega Continua (CD)** con Jenkins.

## 2. Componentes

| Componente | Responsabilidad |
|---|---|
| GitHub | Codigo fuente |
| GitHub Actions | CI |
| Node.js / Express | Aplicacion web |
| Jest | Pruebas |
| ESLint | Analisis estatico |
| Docker | Artefacto desplegable |
| Jenkins | CD |
| Docker Hub o compatible | Registro |

## 3. Pipeline CI

Archivo:

```text
.github/workflows/ci.yml
```

Triggers:

```text
push
pull_request
```

sobre `main` y `develop`.

### Flujo

```text
Checkout
   |
   v
Install dependencies
   |
   v
Static analysis
   |
   v
Tests
   |
   v
Docker build validation
```

Cualquier error provoca que el workflow termine como fallido.

## 4. Pipeline CD

Archivo:

```text
Jenkinsfile
```

### Clone repository

Clona el repositorio y la rama recibidos por parametro.

### Build Docker image

Construye una imagen Docker y utiliza `BUILD_NUMBER` como tag.

Ejemplo:

```text
docker.io/usuario/cicd-lab-webapp:23
```

### Login to Docker registry

Usa Jenkins Credentials con el identificador:

```text
docker-registry-credentials
```

Las credenciales no se guardan en el repositorio.

### Publish Docker image

Publica la version generada en el registro.

### Publish latest tag

Si `GIT_BRANCH` es `main`, tambien publica el tag `latest`.

## 5. Entorno agnostico

El Jenkinsfile parametriza:

- repositorio Git,
- rama,
- registro Docker,
- nombre de imagen.

Por ello la definicion puede reutilizarse con Docker Desktop/HUB, GitHub Container Registry u otros registros compatibles.


## 6. Seguridad

Se aplican las siguientes medidas:

- No almacenar passwords en Git.
- Jenkins Credentials para el registro.
- `docker login --password-stdin`.
- Workflow GitHub con `contents: read`.
- Pruebas y lint antes de validar la imagen.

## Variante Jenkins localhost

Para la entrega actual, Jenkins se considera instalado y ejecutado en localhost.

Por este motivo, el stage de publicacion en un registro externo se sustituye por una validacion local de la imagen Docker.

Flujo:

```text
GitHub
   |
   v
Jenkins localhost
   |
   +--> Clone repository
   +--> Build Docker image
   +--> Validate image
   +--> Run container locally
   +--> Smoke test
             |
             v
      localhost:3000
```

Esta variante mantiene el objetivo de demostrar la definicion del pipeline CD y permite ejecutarlo sin Docker Hub.

La imagen construida permanece disponible en el Docker Engine local.
