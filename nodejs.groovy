job('NodeJS Job2') {
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
        nodejs('nodejs_V12')
    }
    steps {
        shell("npm install")
        shell("pretest_e2e")
        shell("npm test")
    }
}
