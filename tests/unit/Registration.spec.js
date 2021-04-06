import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import Registration from "@/views/Registration";


describe('Registration Component Testing', () => {
    test('Render Registration  Component', () => {
        const { debug } = render(Registration)
        debug()
    })
})
