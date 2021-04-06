import '@testing-library/jest-dom';
import { render } from '@testing-library/vue';
import RegistrationInvite from "@/views/RegistrationInvite";


describe("RegistrationInvite Component Testing", () => {
    test("Render RegistrationInvite Component", () => {
        const { debug } = render(RegistrationInvite)
        debug()
    })
})
