node {
    timeout(time: 20, unit: 'MINUTES') {
        properties([
            disableConcurrentBuilds(),
            buildDiscarder(logRotator(numToKeepStr: '10'))
        ])

        withEnv([
            'CI=true',
            'NEXT_TELEMETRY_DISABLED=1',
            'NPM_CONFIG_AUDIT=false',
            'NPM_CONFIG_FUND=false'
        ]) {
            try {
                docker.image('node:24-bookworm-slim').inside {
                    stage('Checkout') {
                        checkout scm
                    }

                    stage('Install Dependencies') {
                        sh 'npm ci'
                    }

                    stage('Format Code') {
                        sh 'npm run format'
                    }

                    stage('Build') {
                        withCredentials([
                            string(
                                credentialsId: 'neon-database-url',
                                variable: 'DATABASE_URL'
                            )
                        ]) {
                            sh 'npm run build'
                        }
                    }
                }

                echo 'Pipeline berhasil: format dan build selesai.'

                archiveArtifacts(
                    artifacts: '.next/BUILD_ID',
                    allowEmptyArchive: true
                )
            } catch (Exception e) {
                echo 'Pipeline gagal. Periksa log build.'
                throw e
            }
        }
    }
}
