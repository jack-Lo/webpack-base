import '@a/style/base'
import '@a/style/index'
import Welcome from '@/Welcome'

var $greet = document.getElementById('greet')
var m = new Welcome('Jack')

$greet.innerHTML = m.greet()
