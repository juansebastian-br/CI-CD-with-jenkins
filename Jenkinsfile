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
                echo "Clonando repositorio..."
                
                git branch: "${params.GIT_BRANCH}",
                    url: "${params.GIT_REPOSITORY}"
            }
        }

        stage('Build Docker image') {
            steps {
                script {
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}"
                    env.FULL_IMAGE = "${params.IMAGE_NAME}:${env.IMAGE_TAG}"
                }

                sh '''
                    set -e

                    echo "Construyendo imagen Docker: ${FULL_IMAGE}"

                    docker build \
                        -t ${FULL_IMAGE} \
                        -t ${IMAGE_NAME}:latest \
                        .
                '''
            }
        }

        stage('Validate Docker image') {
            steps {
                sh '''
                    set -e

                    echo "Validando imagen Docker..."

                    docker image inspect ${FULL_IMAGE} > /dev/null
                    docker image inspect ${IMAGE_NAME}:latest > /dev/null

                    echo "Imagen validada correctamente:"
                    docker images ${IMAGE_NAME}
                '''
            }
        }

        stage('Clean previous container') {
            steps {
                sh '''
                    echo "Eliminando contenedor anterior..."

                    docker rm -f ${CONTAINER_NAME} 2>/dev/null || true
                '''
            }
        }

        stage('Run container locally') {
            steps {
                sh '''
                    set -e

                    echo "Iniciando contenedor..."

                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        -p ${APP_PORT}:${APP_PORT} \
                        ${FULL_IMAGE}

                    echo "Contenedor iniciado."

                    docker ps --filter "name=${CONTAINER_NAME}"
                '''
            }
        }

        stage('Validate container port') {
            steps {
                sh '''
                    set -e

                    echo "Verificando publicación del puerto..."

                    docker port ${CONTAINER_NAME}

                    echo "Información de puertos:"
                    docker inspect ${CONTAINER_NAME} \
                        --format='{{json .NetworkSettings.Ports}}'
                '''
            }
        }

        stage('Wait for application') {
            steps {
                sh '''
                    echo "Esperando que la aplicación esté disponible..."

                    for i in $(seq 1 12); do

                        if curl -sf http://localhost:${APP_PORT}/health > /dev/null; then
                            echo "La aplicación está disponible."
                            exit 0
                        fi

                        echo "Intento $i/12: aplicación todavía no disponible..."
                        sleep 5
                    done

                    echo "La aplicación no respondió después de 60 segundos."
                    echo "Mostrando logs del contenedor:"
                    docker logs ${CONTAINER_NAME}

                    exit 1
                '''
            }
        }

        stage('Smoke test') {
            steps {
                sh '''
                    set -e

                    echo "Ejecutando Smoke Test..."

                    curl --fail \
                        --show-error \
                        http://localhost:${APP_PORT}/health

                    echo ""
                    echo "Smoke Test exitoso."
                '''
            }
        }
    }

    post {

        always {
            echo "Información final del contenedor:"

            sh '''
                docker ps -a --filter "name=${CONTAINER_NAME}" || true
            '''

            echo "Logs del contenedor:"

            sh '''
                docker logs ${CONTAINER_NAME} 2>&1 || true
            '''

            echo "Eliminando contenedor..."

            sh '''
                docker rm -f ${CONTAINER_NAME} 2>/dev/null || true
            '''
        }

        success {
            echo "======================================"
            echo "Pipeline completado correctamente."
            echo "======================================"
            echo "Imagen creada: ${env.FULL_IMAGE}"
            echo "Imagen latest: ${params.IMAGE_NAME}:latest"
        }

        failure {
            echo "======================================"
            echo "Pipeline fallido."
            echo "Revisar los logs anteriores."
            echo "======================================"
        }
    }
}
