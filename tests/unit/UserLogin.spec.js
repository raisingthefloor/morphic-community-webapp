import "@testing-library/jest-dom";
import { render } from "@testing-library/vue";
import RegistrationInvite from "@/views/RegistrationInvite";


describe("UserLogin Component Testing", () => {
    test("Render UserLogin Component", () => {
        const { debug } = render(RegistrationInvite)
        debug()
    })
})
