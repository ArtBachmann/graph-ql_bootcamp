const message = 'Some message from myModule.js'
const name = 'Art'
const location = 'Vantaa'

const greeting = (name) => {
  return `Welcome ${name}`
}

// named export, as many as needed.
export { message, name, greeting, location as default }