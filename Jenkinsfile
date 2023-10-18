pipeline {

    agent any

    environment {
      PATH = "/home/jenkins/.local/bin:${env.PATH}"
    }

    stages {
        stage('Deploy Dev') {
            when {
                expression {
                    env.BRANCH_NAME == 'RevisedFlow'
                  }
            }      
            steps {
                script {
                 sh 'ansible --version'
                 sh "ansible-playbook -e 'leapbranch=RevisedFlow' -e 'leapserver=localhost' leap-auth-server.yml --vault-password-file /opt/jenkins-data/.vault.id"
                }
            }
        }
        
        stage('Deploy Prod') {
            when {
                expression {
                    env.BRANCH_NAME == 'RevisedFlow-Prod'
                  }
            }
            steps {
                script {
                 sh 'ansible --version'
                 sh "ansible-playbook -i prod.yml -e 'leapserver=prod' -e 'leapbranch=RevisedFlow-Prod' leap-auth-server.yml --key-file ~/.ssh/jenkins-prod.key --vault-password-file /opt/jenkins-data/.vault.id"
                }
            }
        }
    }
}
