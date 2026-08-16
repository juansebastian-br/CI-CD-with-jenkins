pipeline {
    agent any

    parameters {
        string(
            name: 'GIT_REPOSITORY',
            defaultValue: 'https://github.com/juansebastian-br/CI-CD-with-jenkins.git',
            description: 'URL del repositorio GitHub'
        )

        string(
            name: 'GIT_BRANCH',
            defaultValue: 'main',
            description: 'Rama a construir'
        )

        string(
            name: 'IMAGE_NAME',
            defaultValue: 'cicd-lab-webapp',
            description: 'Nombre local de la imagen Docker'
        )
    }

    environment {
        CONTAINER_NAME = 'cicd-lab-webapp-test'
        APP_PORT = '3000'
    }

    stages {

        stage('Clone repository') {
            steps {
                echo "======================================"
                echo "CLONANDO REPOSITORIO"
                echo "======================================"

                git branch: "${params.GIT_BRANCH}",
                    url: "${params.GIT_REPOSITORY}"
            }
        }

        stage('Check Docker') {
            steps {
                sh '''
                    echo "======================================"
                    echo "VERIFICANDO DOCKER"
                    echo "======================================"

                    whoami
                    docker --version
                    docker ps -a
                '''
            }
        }

        stage('Build Docker image') {
            steps {
                script {
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}"
                    env.FULL_IMAGE = "${params.IMAGE_NAME}:${env.IMAGE_TAG}"
                }

                sh '''
                    echo "======================================"
                    echo "CONSTRUYENDO IMAGEN"
                    echo "======================================"

                    docker build \
                        -t ${FULL_IMAGE} \
                        -t ${IMAGE_NAME}:latest \
                        .

                    echo "Imagen creada:"
                    docker images ${IMAGE_NAME}
                '''
            }
        }

        stage('Validate Docker image') {
            steps {
                sh '''
                    echo "======================================"
                    echo "VALIDANDO IMAGEN"
                    echo "======================================"

                    docker image inspect ${FULL_IMAGE}

                    echo "Imagen válida."
                '''
            }
        }

        stage('Remove previous container') {
            steps {
                sh '''
                    echo "======================================"
                    echo "ELIMINANDO CONTENEDOR ANTERIOR"
                    echo "======================================"

                    docker rm -f ${CONTAINER_NAME} 2>/dev/null || true

                    echo "Contenedores actuales:"
                    docker ps -a
                '''
            }
        }

        stage('Run Docker container') {
            steps {
                sh '''
                    echo "======================================"
                    echo "EJECUTANDO DOCKER RUN"
                    echo "======================================"

                    echo "Imagen: ${FULL_IMAGE}"
                    echo "Contenedor: ${CONTAINER_NAME}"
                    echo "Puerto: ${APP_PORT}:${APP_PORT}"

                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        -p ${APP_PORT}:${APP_PORT} \
                        ${FULL_IMAGE}

                    echo "======================================"
                    echo "DOCKER RUN EJECUTADO"
                    echo "======================================"

                    docker ps -a

                    echo "======================================"
                    echo "PUERTOS DEL CONTENEDOR"
                    echo "======================================"

                    docker port ${CONTAINER_NAME}
                '''
            }
        }

        stage('Check container') {
            steps {
                sh '''
                    echo "======================================"
                    echo "ESTADO DEL CONTENEDOR"
                    echo "======================================"

                    docker ps -a \
                        --filter "name=${CONTAINER_NAME}"

                    echo "======================================"
                    echo "LOGS DEL CONTENEDOR"
                    echo "======================================"

                    docker logs ${CONTAINER_NAME} 2>&1 || true
                '''
            }
        }

        stage('Smoke test') {
            steps {
                sh '''
                    echo "======================================"
                    echo "SMOKE TEST"
                    echo "======================================"

                    sleep 5

                    curl --fail \
                        --show-error \
                        http://localhost:${APP_PORT}/health
                '''
            }
        }
    }

    stage('Cleanup old images') {
    steps {
        sh '''
            echo "======================================"
            echo "LIMPIANDO IMÁGENES ANTIGUAS"
            echo "======================================"

            CURRENT_BUILD=${BUILD_NUMBER}
            MIN_BUILD=$((CURRENT_BUILD - 2))

            echo "Build actual: ${CURRENT_BUILD}"
            echo "Conservando builds: ${MIN_BUILD}, $((CURRENT_BUILD - 1)), ${CURRENT_BUILD}"

            for TAG in $(docker images ${IMAGE_NAME} \
                --format '{{.Tag}}' \
                | grep -E '^[0-9]+$'); do

                if [ "$TAG" -lt "$MIN_BUILD" ]; then
                    echo "Eliminando: ${IMAGE_NAME}:${TAG}"
                    docker rmi "${IMAGE_NAME}:${TAG}" || true
                fi
            done

            echo "======================================"
            echo "IMÁGENES DESPUÉS DE LA LIMPIEZA"
            echo "======================================"

            docker images ${IMAGE_NAME}
        '''
    }
}

    post {

        success {
            echo "======================================"
            echo "PIPELINE EXITOSO"
            echo "======================================"

            sh '''
                echo "Contenedor:"
                docker ps -a --filter "name=${CONTAINER_NAME}"

                echo "Puerto:"
                docker port ${CONTAINER_NAME}

                echo "Logs:"
                docker logs ${CONTAINER_NAME} 2>&1 || true
            '''
        }

        failure {
            echo "======================================"
            echo "PIPELINE FALLIDO"
            echo "======================================"

            sh '''
                echo "Contenedores:"
                docker ps -a

                echo "Logs del contenedor:"
                docker logs ${CONTAINER_NAME} 2>&1 || true
            '''
        }


    }
}
