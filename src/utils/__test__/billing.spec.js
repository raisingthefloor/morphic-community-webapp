import {getPlans} from "@/utils/billing";


jest.mock("../billing", () => () => ({
    getBillingInfo: {

    }
}) )

describe("Billing Service", () => {
    test("Get Plan", () => {
        expect(getPlans()).toBeTruthy();
    });
});


