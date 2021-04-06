import '@testing-library/jest-dom';
import { render } from '@testing-library/vue';
import PlanPicker from "@/components/PlanPicker";


describe("PlanPicker Component Testing", () => {
    test("Render PlanPicker Component", () => {
        const { debug } = render(PlanPicker)
        debug()
    })
})
