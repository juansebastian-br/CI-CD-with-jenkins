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

    stages {

        stage('Clone repository') {
            steps {
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

                bat '''
                    docker build -t %FULL_IMAGE% .
                    docker tag %FULL_IMAGE% %IMAGE_NAME%:latest
                '''
            }
        }

        stage('Validate Docker image') {
            steps {
                bat '''
                    docker image inspect %FULL_IMAGE%
                    docker image inspect %IMAGE_NAME%:latest
                '''
            }
        }

        stage('Run container locally') {
            steps {
                bat '''
                    docker rm -f cicd-lab-webapp-test 2>NUL || exit /b 0

                    docker run -d ^
                      --name cicd-lab-webapp-test ^
                      -p 3000:3000 ^
                      %FULL_IMAGE%

                    timeout /t 5 /nobreak
                '''
            }
        }

        stage('Smoke test') {
            steps {
                bat '''
                    curl --fail http://localhost:3000/health
                '''
            }
        }
    }

    post {

        always {
            bat '''
                docker rm -f cicd-lab-webapp-test 2>NUL || exit /b 0
            '''
        }

        success {
            echo "Pipeline completado correctamente."
            echo "Imagen creada: ${env.FULL_IMAGE}"
            echo "Imagen latest: ${params.IMAGE_NAME}:latest"
        }

        failure {
            echo "Pipeline fallido. Revisar logs de Jenkins."
        }
    }
}
