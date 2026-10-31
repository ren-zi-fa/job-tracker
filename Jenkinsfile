pipeline {
  agent {
    docker {
      image 'node:24-bookworm-slim'
    }
  }

  options {
    timeout(time: 20, unit: 'MINUTES')
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  environment {
    CI = 'true'
    NEXT_TELEMETRY_DISABLED = '1'
    NPM_CONFIG_AUDIT = 'false'
    NPM_CONFIG_FUND = 'false'
    
    DATABASE_URL = credentials('neon-database-url')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Format Code') {
      steps {
        sh 'npm run format'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }
  }

  post {
    success {
      echo 'Pipeline berhasil: format, test, dan build selesai.'
      archiveArtifacts artifacts: '.next/BUILD_ID', allowEmptyArchive: true
    }
    failure {
      echo 'Pipeline gagal. Periksa log stage yang berwarna merah.'
    }
  }
}
