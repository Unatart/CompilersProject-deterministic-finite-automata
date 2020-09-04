                    import {toPostfix} from "../toPostfix";
import {insertExplicitConcatOperator} from "../App";
import {FA} from "../FA";

describe("FA", () => {
    describe("строит и минимизирует a", () => {
        const regex_with_dots = insertExplicitConcatOperator("a");
        const prefix_regex_with_dots = toPostfix(regex_with_dots);
        const fa = new FA(prefix_regex_with_dots);
        fa.toDFA();
        fa.minimize();
        it("a", () => {
            expect(fa.check("a")).toBeTruthy();
        });

        it("b", () => {
            expect(fa.check("b")).toBeFalsy();
        });

        it("aabb", () => {
            expect(fa.check("aabb")).toBeFalsy();
        })

        it("", () => {
            expect(fa.check("")).toBeFalsy();
        });

        it("nnnnn", () => {
            expect(fa.check("nnnnn")).toBeFalsy();
        });
    });

    describe("строит и минимизирует a+b", () => {
        const regex_with_dots = insertExplicitConcatOperator("a+b");
        const prefix_regex_with_dots = toPostfix(regex_with_dots);
        const fa = new FA(prefix_regex_with_dots);
        fa.toDFA();
        fa.minimize();
        it("a", () => {
            expect(fa.check("a")).toBeTruthy();
        });

        it("b", () => {
            expect(fa.check("b")).toBeTruthy();
        });

        it("aabb", () => {
            expect(fa.check("aabb")).toBeFalsy();
        })

        it("", () => {
            expect(fa.check("")).toBeFalsy();
        });

        it("nnnnn", () => {
            expect(fa.check("nnnnn")).toBeFalsy();
        });
    });

    describe("строит и минимизирует ab", () => {
        const regex_with_dots = insertExplicitConcatOperator("ab");
        const prefix_regex_with_dots = toPostfix(regex_with_dots);
        const fa = new FA(prefix_regex_with_dots);
        fa.toDFA();
        fa.minimize();
        it("ab", () => {
            expect(fa.check("ab")).toBeTruthy();
        });

        it("b", () => {
            expect(fa.check("b")).toBeFalsy();
        });

        it("aabb", () => {
            expect(fa.check("aabb")).toBeFalsy();
        })

        it("", () => {
            expect(fa.check("")).toBeFalsy();
        });

        it("nnnnn", () => {
            expect(fa.check("nnnnn")).toBeFalsy();
        });
    });

    describe("строит и минимизирует a*", () => {
        const regex_with_dots = insertExplicitConcatOperator("a*");
        const prefix_regex_with_dots = toPostfix(regex_with_dots);
        const fa = new FA(prefix_regex_with_dots);
        fa.toDFA();
        fa.minimize();
        it("a", () => {
            expect(fa.check("a")).toBeTruthy();
        });

        it("aaaaaaaa", () => {
            expect(fa.check("b")).toBeTruthy();
        });

        it("b", () => {
            expect(fa.check("aabb")).toBeFalsy();
        })

        it("", () => {
            expect(fa.check("")).toBeTruthy();
        });

        it("nnnnn", () => {
            expect(fa.check("nnnnn")).toBeFalsy();
        });
    });

    describe("строит и минимизирует (ab)*", () => {
        const regex_with_dots = insertExplicitConcatOperator("(ab)*");
        const prefix_regex_with_dots = toPostfix(regex_with_dots);
        const fa = new FA(prefix_regex_with_dots);
        fa.toDFA();
        fa.minimize();
        it("ab", () => {
            expect(fa.check("ab")).toBeTruthy();
        });

        it("ababab", () => {
            expect(fa.check("ababab")).toBeTruthy();
        });

        it("aabb", () => {
            expect(fa.check("aabb")).toBeFalsy();
        })

        it("", () => {
            expect(fa.check("")).toBeTruthy();
        });

        it("nnnnn", () => {
            expect(fa.check("nnnnn")).toBeFalsy();
        });
    });

    describe("строит и минимизирует (a+b)*", () => {
        const regex_with_dots = insertExplicitConcatOperator("(a+b)*");
        const prefix_regex_with_dots = toPostfix(regex_with_dots);
        const fa = new FA(prefix_regex_with_dots);
        fa.toDFA();
        fa.minimize();
        it("aaaabbbbb", () => {
            expect(fa.check("aaaabbbbb")).toBeTruthy();
        });

        it("b", () => {
            expect(fa.check("b")).toBeTruthy();
        });

        it("bbbabbababbababba", () => {
            expect(fa.check(("bbbabbababbababba"))).toBeTruthy();
        })

        it("aabbxx", () => {
            expect(fa.check("aabbxx")).toBeFalsy();
        })

        it("", () => {
            expect(fa.check("")).toBeTruthy();
        });

        it("nnnnn", () => {
            expect(fa.check("nnnnn")).toBeFalsy();
        });
    });

    describe("строит и минимизирует ab*a", () => {
        const regex_with_dots = insertExplicitConcatOperator("ab*a");
        const prefix_regex_with_dots = toPostfix(regex_with_dots);
        const fa = new FA(prefix_regex_with_dots);
        fa.toDFA();
        fa.minimize();
        it("aa", () => {
            expect(fa.check("aa")).toBeTruthy();
        });

        it("aba", () => {
            expect(fa.check("aba")).toBeTruthy();
        });

        it("abbbbbbbbbba", () => {
            expect(fa.check(("abbbbbbbbbba"))).toBeTruthy();
        })

        it("aabbxx", () => {
            expect(fa.check("aabbxx")).toBeFalsy();
        })

        it("", () => {
            expect(fa.check("")).toBeFalsy();
        });

        it("nnnnn", () => {
            expect(fa.check("nnnnn")).toBeFalsy();
        });
    });

    describe("строит и минимизирует abb+acb и проверяет строки:", () => {
        const regex_with_dots = insertExplicitConcatOperator("abb+acb");
        const prefix_regex_with_dots = toPostfix(regex_with_dots);
        const fa = new FA(prefix_regex_with_dots);
        fa.toDFA();
        fa.minimize();
        it("abb", () => {
            expect(fa.check("abb")).toBeTruthy();
        });

        it("acb", () => {
            expect(fa.check("acb")).toBeTruthy();
        });

        it("a", () => {
            expect(fa.check("a")).toBeFalsy();
        });

        it("ab", () => {
            expect(fa.check("ab")).toBeFalsy();
        });

        it("", () => {
            expect(fa.check("")).toBeFalsy();
        });

        it("nnn", () => {
            expect(fa.check("nnn")).toBeFalsy();
        });
    });

    describe("строит и минимизирует (a+b)*abb и проверяет строки:", () => {
        const regex_with_dots = insertExplicitConcatOperator("(a+b)*abb");
        const prefix_regex_with_dots = toPostfix(regex_with_dots);
        const fa = new FA(prefix_regex_with_dots);
        fa.toDFA();
        fa.minimize();
        it("aaabb", () => {
            expect(fa.check("aaabb")).toBeTruthy();
        });
        it("bbbbbbbbbbabb", () => {
            expect(fa.check("bbbbbbbbbbabb")).toBeTruthy();
        });
        it("abb", () => {
            expect(fa.check("abb")).toBeTruthy();
        });
        it("nnnn", () => {
            expect(fa.check("nnnn")).toBeFalsy();
        });
        it("", () => {
            expect(fa.check("")).toBeFalsy();
        });
    });

    describe("строит и минимизирует a(a+b)* и проверяет строки:", () => {
        const regex_with_dots = insertExplicitConcatOperator("a(a+b)*");
        const prefix_regex_with_dots = toPostfix(regex_with_dots);
        const fa = new FA(prefix_regex_with_dots);
        fa.toDFA();
        fa.minimize();
        it("aaa", () => {
            expect(fa.check("aaa")).toBeTruthy();
        });
        it("a", () => {
            expect(fa.check("a")).toBeTruthy();
        });
        it("abb", () => {
            expect(fa.check("abb")).toBeTruthy();
        });
        it("aaaabbbb", () => {
            expect(fa.check("nnnn")).toBeFalsy();
        });
        it("", () => {
            expect(fa.check("")).toBeFalsy();
        });
    });

    describe("строит и минимизирует aa*+bb* и проверяет строки:", () => {
        const regex_with_dots = insertExplicitConcatOperator("aa*+bb*");
        const prefix_regex_with_dots = toPostfix(regex_with_dots);
        const fa = new FA(prefix_regex_with_dots);
        fa.toDFA();
        fa.minimize();
        it("aaa", () => {
            expect(fa.check("aaa")).toBeTruthy();
        });
        it("a", () => {
            expect(fa.check("a")).toBeTruthy();
        });
        it("b", () => {
            expect(fa.check("b")).toBeTruthy();
        });
        it("baaaaa", () => {
            expect(fa.check("baaaaa")).toBeFalsy();
        });
        it("aaaabbbb", () => {
            expect(fa.check("aaaabbbb")).toBeFalsy();
        });
        it("", () => {
            expect(fa.check("")).toBeFalsy();
        });
    });

    describe("строит и минимизирует (a+b)*abb* и проверяет строки:", () => {
        const regex_with_dots = insertExplicitConcatOperator("(a+b)*abb*");
        const prefix_regex_with_dots = toPostfix(regex_with_dots);
        console.log(prefix_regex_with_dots);
        const fa = new FA(prefix_regex_with_dots);
        fa.toDFA();
        fa.minimize();
        it("ab", () => {
            expect(fa.check("ab")).toBeTruthy();
        });
        it("abb", () => {
            expect(fa.check("abb")).toBeTruthy();
        });
        it("aaaabbbb", () => {
            expect(fa.check("aaaabbbb")).toBeTruthy();
        });
        it("baaaaa", () => {
            expect(fa.check("baaaaa")).toBeFalsy();
        });
        it("abbba", () => {
            expect(fa.check("abbba")).toBeFalsy();
        });
        it("", () => {
            expect(fa.check("")).toBeFalsy();
        });
    });
});
