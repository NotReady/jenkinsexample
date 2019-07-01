job('NodeJS Job') {
    scm {
        git('https://github.com/NotReady/jenkinsexample.git') {  node ->
            node / gitConfigName('DSL User')
            node / gitConfigEmail('jenkins-dsl@example.com')
        }
    }
    triggers {
        scm('H/5 * * * *')
    }
    wrappers {
        nodejs('nodejs_v12')
    }
    steps {
        shell("npm install")
        shell("npm test")
    }
}
