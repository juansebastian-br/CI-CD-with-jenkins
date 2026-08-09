# Laboratorio CI/CD con GitHub Actions y Jenkins

Este repositorio contiene una aplicacion web minima y dos definiciones de pipeline:

- **CI con GitHub Actions**: checkout, instalacion de dependencias, analisis estatico, pruebas y validacion de la imagen Docker.
- **CD con Jenkins**: clonacion del repositorio, construccion de imagen Docker y publicacion en un registro.

## Arquitectura

```text
Desarrollador
    |
    | push / pull request
    v
GitHub
    |
    +----> GitHub Actions
    |        - Checkout
    |        - npm install
    |        - ESLint
    |        - Jest
    |        - docker build
    |
    +----> Jenkins
             - Clone repository
             - Build Docker image
             - Login registry
             - Push image
             - Tag latest
                    |
                    v
              Docker Registry
```

## Aplicacion

La aplicacion usa Node.js y Express.

Endpoints:

- `GET /`
- `GET /health`

Ejecucion local:

```bash
npm install
npm test
npm run lint
npm start
```

La aplicacion escucha en `http://localhost:3000`.

## CI con GitHub Actions

Configuracion:

```text
.github/workflows/ci.yml
```

El workflow se ejecuta automaticamente ante:

- `push` a `main` o `develop`
- `pull_request` hacia `main` o `develop`

Pasos:

1. Checkout del codigo.
2. Configuracion de Node.js 20.
3. Instalacion de dependencias.
4. Analisis estatico con ESLint.
5. Pruebas con Jest.
6. Validacion de la construccion de la imagen Docker.

## CD con Jenkins

Configuracion:

```text
Jenkinsfile
```

Stages definidos:

1. `Clone repository`
2. `Build Docker image`
3. `Login to Docker registry`
4. `Publish Docker image`
5. `Publish latest tag`

El pipeline esta parametrizado para evitar acoplarlo a un entorno determinado.

### Credencial Jenkins

Crear una credencial de tipo **Username with password** con ID:

```text
docker-registry-credentials
```

Para Docker Hub, el password puede ser un access token.

### Parametros

| Parametro | Ejemplo | Uso |
|---|---|---|
| `GIT_REPOSITORY` | `https://github.com/juansebastian-br/CI-CD-with-jenkins.git` | Repositorio |
| `GIT_BRANCH` | `main` | Rama |
| `DOCKER_REGISTRY` | `docker.io` | Registro |
| `DOCKER_IMAGE` | `alumno/cicd-lab-webapp` | Imagen |

## Docker

```bash
docker build -t cicd-lab-webapp:local .
docker run --rm -p 3000:3000 cicd-lab-webapp:local
```

Validacion:

```bash
curl http://localhost:3000/health
```

Respuesta:

```json
{"status":"UP"}
```

## Subida a GitHub

```bash
git init
git add .
git commit -m "Initial CI/CD laboratory"
git branch -M main
git remote add origin https://github.com/juansebastian-br/CI-CD-with-jenkins.git
git push -u origin main
```

Sustituye `USUARIO` por tu usuario u organizacion de GitHub.

## Configuracion basica de Jenkins

1. Crear un nuevo Job de tipo **Pipeline**.
2. Seleccionar **Pipeline script from SCM**.
3. SCM: **Git**.
4. Introducir la URL del repositorio.
5. Branch: `*/main`.
6. Script Path: `Jenkinsfile`.
7. Guardar.
8. Ejecutar **Build with Parameters**.

Para que Docker funcione realmente, el agente Jenkins debe disponer de acceso al runtime Docker o a una alternativa de build compatible.

## Evidencias

### GitHub Actions

Capturar:

- Nombre del workflow.
- Ejecucion asociada a un commit.
- Steps en estado correcto.

Guardar como:

```text
capturas/github-actions-ci.png
```

### Jenkins

Capturar:

- Stage View o Pipeline Steps.
- Los stages del `Jenkinsfile`.

Guardar como:

```text
capturas/jenkins-cd.png
```

## Entregables incluidos

- Codigo fuente.
- `.github/workflows/ci.yml`.
- `Jenkinsfile`.
- `Dockerfile`.
- `README.md`.
- `docs/documentacion-tecnica.md`.
- Carpeta `capturas/` para las evidencias.


## Jenkins ejecutado en localhost

En esta variante, Jenkins se ejecuta directamente en el equipo local y utiliza el Docker Engine del mismo host.

El pipeline ya no publica la imagen en Docker Hub. En su lugar:

1. Clona el repositorio.
2. Construye una imagen Docker local.
3. Crea el tag `latest`.
4. Valida que la imagen exista.
5. Ejecuta temporalmente el contenedor en `localhost:3000`.
6. Comprueba el endpoint `/health`.
7. Elimina el contenedor de prueba al finalizar.

La imagen permanece disponible localmente:

```bash
docker images
```

Ejemplo:

```text
cicd-lab-webapp:15
cicd-lab-webapp:latest
```

### Requisitos del host Jenkins

El equipo donde se ejecuta Jenkins debe tener:

```text
Git
Docker
curl
```

Además, el usuario del servicio Jenkins debe poder ejecutar Docker.

En Linux, normalmente:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

Despues se recomienda validar:

```bash
sudo -u jenkins docker ps
```

Si Jenkins se ejecuta dentro de un contenedor Docker, esta configuracion cambia y normalmente se requiere montar `/var/run/docker.sock`.
