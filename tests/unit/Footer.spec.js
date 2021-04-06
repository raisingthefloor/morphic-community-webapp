import "@testing-library/jest-dom";
import { render } from "@testing-library/vue";
import Vuei18n from "vue-i18n";
import Footer from "@/components/Footer";

const messages = {
    en: {
        Footer: {
            copyright: `Copyright © ${new Date().getFullYear()} Raising the Floor - US Inc. All rights Reserved`
        },
    }
}

describe("Footer Component Testing", () => {
    it("Render Footer Component", async () => {
        const { getByText, debug } = render(Footer, {}, vue =>{
            vue.use(Vuei18n)
            const i18n = new Vuei18n({
                locale: 'en',
                fallbackLocale: 'en',
                messages,
            })
            return {
                i18n,
            }
        })
        expect(getByText(messages.en.Footer.copyright)).toBeInTheDocument();
    })
})
