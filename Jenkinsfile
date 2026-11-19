pipeline {
  agent any
  environment { CI = 'true' }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Install') { steps { sh 'npm ci' } }
    stage('Tests & Coverage') { steps { sh 'npm test' } }
    stage('Build') { steps { sh 'npm run build' } }
  }
  post {
    always {
      archiveArtifacts artifacts: 'coverage/**,dist/**', allowEmptyArchive: true
    }
  }
}
