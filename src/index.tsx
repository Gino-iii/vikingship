import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import './styles/index.scss'

library.add(fas as any)

export { default as Button } from './components/Button'
export { default as Menu } from './components/Menu'
export { default as AutoComplete } from './components/AutoComplete'
export { default as Icon } from './components/Icon'
export { default as Input } from './components/Input'
export { default as Progress } from './components/Progress'
export { default as Transition } from './components/Transition'
export { default as Upload } from './components/Upload'
export { default as Tabs } from './components/Tabs'
export { default as Alert } from './components/Alert'
export { default as Select } from './components/Select'
export { default as Form } from './components/Form'
