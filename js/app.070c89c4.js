(function(e) {
    function a(a) {
        for (var n, c, r = a[0], u = a[1], s = a[2], d = 0, l = []; d < r.length; d++)
            c = r[d],
            Object.prototype.hasOwnProperty.call(o, c) && o[c] && l.push(o[c][0]),
            o[c] = 0;
        for (n in u)
            Object.prototype.hasOwnProperty.call(u, n) && (e[n] = u[n]);
        f && f(a);
        while (l.length)
            l.shift()();
        return i.push.apply(i, s || []),
        t()
    }
    function t() {
        for (var e, a = 0; a < i.length; a++) {
            for (var t = i[a], n = !0, c = 1; c < t.length; c++) {
                var r = t[c];
                0 !== o[r] && (n = !1)
            }
            n && (i.splice(a--, 1),
            e = u(u.s = t[0]))
        }
        return e
    }
    var n = {}
      , c = {
        app: 0
    }
      , o = {
        app: 0
    }
      , i = [];
    function r(e) {
        return u.p + "js/" + ({}[e] || e) + "." + {
            "chunk-2d22bcc3": "788e2466",
            "chunk-610489cc": "d81ffdd9",
            "chunk-d0a9a6f8": "83c66b65",
            "chunk-5e317961": "52edefb7",
            "chunk-1a1a4ed0": "145a5b0c",
            "chunk-402241b6": "6a9d21c2",
            "chunk-59421948": "ca306c15",
            "chunk-e8c7a9ae": "e7991a1b",
            "chunk-75bca81a": "6e521512",
            "chunk-2d22bf42": "c2b24a0b",
            "chunk-25cf1bea": "cacc2a71",
            "chunk-20680bbe": "07afc537",
            "chunk-593ecb3d": "8c50d220",
            "chunk-5b77a0d8": "7a706706",
            "chunk-68e032c4": "df29c858",
            "chunk-cf639660": "227333a2",
            "chunk-8e696c16": "a868324d",
            "chunk-0ad02984": "84625de2",
            "chunk-12090e5a": "28c408a6",
            "chunk-24724f76": "fc93f248",
            "chunk-28644bb0": "ccda5bef",
            "chunk-3419fd6c": "7979d974",
            "chunk-371a653e": "a41675f6",
            "chunk-3d927944": "47622a23",
            "chunk-41bf2d96": "eaf9c5ba",
            "chunk-4f1d3cfe": "b93ee402",
            "chunk-517983c9": "1751b80b",
            "chunk-571d47bf": "b6220d7e",
            "chunk-589a0bc7": "afa9ba35",
            "chunk-624a4bb3": "244529c0",
            "chunk-65727c73": "d4920cc8",
            "chunk-723b5e5d": "5d806a54",
            "chunk-72ae5df7": "6ee6fcf2",
            "chunk-7a00f1b0": "77ab16c0",
            "chunk-8eb61ca0": "0887e61e",
            "chunk-90662924": "5529d120",
            "chunk-a32578e4": "ac37b47c",
            "chunk-a994ecf2": "95216b20",
            "chunk-cac4d520": "7cb8cf47",
            "chunk-cda4d2f4": "ab8f5e09",
            "chunk-546837cd": "ccca62ac",
            "chunk-1e1e2ade": "b5d64566",
            "chunk-7bb7ee9a": "785c925b",
            "chunk-8d89d014": "d4dd5c29",
            "chunk-03ed405e": "de7d55df",
            "chunk-0d4fa7e7": "7988bae7",
            "chunk-1e473b26": "c2b0898d",
            "chunk-7d76483f": "895962f1",
            "chunk-09b8b3f1": "6e234e1d",
            "chunk-0d36f369": "014221fc",
            "chunk-3ce4bd1f": "114f6d92",
            "chunk-55d2e3ac": "345d56ed",
            "chunk-7968cfae": "ae47a981",
            "chunk-96cdd340": "931215c3",
            "chunk-ff91d47c": "4dc8a835",
            "chunk-665fac01": "c5ef7978",
            "chunk-ba12ebd0": "8573e5fe",
            "chunk-a924f88a": "bdb518e0",
            "chunk-c3cb6c8e": "fbb21b57",
            "chunk-db0cf57a": "2a4b2a36",
            "chunk-e6222578": "5324f883",
            "chunk-f1d3d4d6": "81b6f027"
        }[e] + ".js"
    }
    function u(a) {
        if (n[a])
            return n[a].exports;
        var t = n[a] = {
            i: a,
            l: !1,
            exports: {}
        };
        return e[a].call(t.exports, t, t.exports, u),
        t.l = !0,
        t.exports
    }
    u.e = function(e) {
        var a = []
          , t = {
            "chunk-d0a9a6f8": 1,
            "chunk-1a1a4ed0": 1,
            "chunk-402241b6": 1,
            "chunk-59421948": 1,
            "chunk-e8c7a9ae": 1,
            "chunk-593ecb3d": 1,
            "chunk-5b77a0d8": 1,
            "chunk-68e032c4": 1,
            "chunk-cf639660": 1,
            "chunk-8e696c16": 1,
            "chunk-0ad02984": 1,
            "chunk-12090e5a": 1,
            "chunk-24724f76": 1,
            "chunk-28644bb0": 1,
            "chunk-3419fd6c": 1,
            "chunk-371a653e": 1,
            "chunk-3d927944": 1,
            "chunk-41bf2d96": 1,
            "chunk-4f1d3cfe": 1,
            "chunk-517983c9": 1,
            "chunk-571d47bf": 1,
            "chunk-589a0bc7": 1,
            "chunk-624a4bb3": 1,
            "chunk-65727c73": 1,
            "chunk-723b5e5d": 1,
            "chunk-72ae5df7": 1,
            "chunk-7a00f1b0": 1,
            "chunk-8eb61ca0": 1,
            "chunk-90662924": 1,
            "chunk-a32578e4": 1,
            "chunk-a994ecf2": 1,
            "chunk-cac4d520": 1,
            "chunk-cda4d2f4": 1,
            "chunk-546837cd": 1,
            "chunk-1e1e2ade": 1,
            "chunk-7bb7ee9a": 1,
            "chunk-03ed405e": 1,
            "chunk-0d4fa7e7": 1,
            "chunk-1e473b26": 1,
            "chunk-7d76483f": 1,
            "chunk-09b8b3f1": 1,
            "chunk-0d36f369": 1,
            "chunk-3ce4bd1f": 1,
            "chunk-55d2e3ac": 1,
            "chunk-7968cfae": 1,
            "chunk-96cdd340": 1,
            "chunk-ff91d47c": 1,
            "chunk-665fac01": 1,
            "chunk-c3cb6c8e": 1,
            "chunk-db0cf57a": 1,
            "chunk-e6222578": 1,
            "chunk-f1d3d4d6": 1
        };
        c[e] ? a.push(c[e]) : 0 !== c[e] && t[e] && a.push(c[e] = new Promise((function(a, t) {
            for (var n = "css/" + ({}[e] || e) + "." + {
                "chunk-2d22bcc3": "31d6cfe0",
                "chunk-610489cc": "31d6cfe0",
                "chunk-d0a9a6f8": "4dbea570",
                "chunk-5e317961": "31d6cfe0",
                "chunk-1a1a4ed0": "7588fbd8",
                "chunk-402241b6": "7588fbd8",
                "chunk-59421948": "7588fbd8",
                "chunk-e8c7a9ae": "7588fbd8",
                "chunk-75bca81a": "31d6cfe0",
                "chunk-2d22bf42": "31d6cfe0",
                "chunk-25cf1bea": "31d6cfe0",
                "chunk-20680bbe": "31d6cfe0",
                "chunk-593ecb3d": "167f224d",
                "chunk-5b77a0d8": "9b1e46c4",
                "chunk-68e032c4": "9b1e46c4",
                "chunk-cf639660": "9b1e46c4",
                "chunk-8e696c16": "2119b9b7",
                "chunk-0ad02984": "3ff47628",
                "chunk-12090e5a": "b9e830a2",
                "chunk-24724f76": "86996065",
                "chunk-28644bb0": "b9e830a2",
                "chunk-3419fd6c": "c82b503b",
                "chunk-371a653e": "53448e5d",
                "chunk-3d927944": "23334a72",
                "chunk-41bf2d96": "86996065",
                "chunk-4f1d3cfe": "b9e830a2",
                "chunk-517983c9": "f06574c8",
                "chunk-571d47bf": "931146e4",
                "chunk-589a0bc7": "f5efc37f",
                "chunk-624a4bb3": "50924012",
                "chunk-65727c73": "5d265f89",
                "chunk-723b5e5d": "7a8bbef6",
                "chunk-72ae5df7": "b2aa6807",
                "chunk-7a00f1b0": "ca728f46",
                "chunk-8eb61ca0": "602e2264",
                "chunk-90662924": "a1fd700f",
                "chunk-a32578e4": "86996065",
                "chunk-a994ecf2": "e03da3c8",
                "chunk-cac4d520": "931146e4",
                "chunk-cda4d2f4": "e8071199",
                "chunk-546837cd": "4f19eb0b",
                "chunk-1e1e2ade": "f6fbe297",
                "chunk-7bb7ee9a": "b9e830a2",
                "chunk-8d89d014": "31d6cfe0",
                "chunk-03ed405e": "49273354",
                "chunk-0d4fa7e7": "302c2e2d",
                "chunk-1e473b26": "00b07b16",
                "chunk-7d76483f": "d514bd62",
                "chunk-09b8b3f1": "c768ce5f",
                "chunk-0d36f369": "d73247e7",
                "chunk-3ce4bd1f": "8d3a6a19",
                "chunk-55d2e3ac": "e12e6522",
                "chunk-7968cfae": "63e7b3d5",
                "chunk-96cdd340": "f1bb92dc",
                "chunk-ff91d47c": "1eb614eb",
                "chunk-665fac01": "582154b3",
                "chunk-ba12ebd0": "31d6cfe0",
                "chunk-a924f88a": "31d6cfe0",
                "chunk-c3cb6c8e": "22d8ef6e",
                "chunk-db0cf57a": "8c9417ff",
                "chunk-e6222578": "d91688e3",
                "chunk-f1d3d4d6": "8f1ffd56"
            }[e] + ".css", o = u.p + n, i = document.getElementsByTagName("link"), r = 0; r < i.length; r++) {
                var s = i[r]
                  , d = s.getAttribute("data-href") || s.getAttribute("href");
                if ("stylesheet" === s.rel && (d === n || d === o))
                    return a()
            }
            var l = document.getElementsByTagName("style");
            for (r = 0; r < l.length; r++) {
                s = l[r],
                d = s.getAttribute("data-href");
                if (d === n || d === o)
                    return a()
            }
            var f = document.createElement("link");
            f.rel = "stylesheet",
            f.type = "text/css",
            f.onload = a,
            f.onerror = function(a) {
                var n = a && a.target && a.target.src || o
                  , i = new Error("Loading CSS chunk " + e + " failed.\n(" + n + ")");
                i.code = "CSS_CHUNK_LOAD_FAILED",
                i.request = n,
                delete c[e],
                f.parentNode.removeChild(f),
                t(i)
            }
            ,
            f.href = o;
            var m = document.getElementsByTagName("head")[0];
            m.appendChild(f)
        }
        )).then((function() {
            c[e] = 0
        }
        )));
        var n = o[e];
        if (0 !== n)
            if (n)
                a.push(n[2]);
            else {
                var i = new Promise((function(a, t) {
                    n = o[e] = [a, t]
                }
                ));
                a.push(n[2] = i);
                var s, d = document.createElement("script");
                d.charset = "utf-8",
                d.timeout = 120,
                u.nc && d.setAttribute("nonce", u.nc),
                d.src = r(e);
                var l = new Error;
                s = function(a) {
                    d.onerror = d.onload = null,
                    clearTimeout(f);
                    var t = o[e];
                    if (0 !== t) {
                        if (t) {
                            var n = a && ("load" === a.type ? "missing" : a.type)
                              , c = a && a.target && a.target.src;
                            l.message = "Loading chunk " + e + " failed.\n(" + n + ": " + c + ")",
                            l.name = "ChunkLoadError",
                            l.type = n,
                            l.request = c,
                            t[1](l)
                        }
                        o[e] = void 0
                    }
                }
                ;
                var f = setTimeout((function() {
                    s({
                        type: "timeout",
                        target: d
                    })
                }
                ), 12e4);
                d.onerror = d.onload = s,
                document.head.appendChild(d)
            }
        return Promise.all(a)
    }
    ,
    u.m = e,
    u.c = n,
    u.d = function(e, a, t) {
        u.o(e, a) || Object.defineProperty(e, a, {
            enumerable: !0,
            get: t
        })
    }
    ,
    u.r = function(e) {
        "undefined" !== typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
            value: "Module"
        }),
        Object.defineProperty(e, "__esModule", {
            value: !0
        })
    }
    ,
    u.t = function(e, a) {
        if (1 & a && (e = u(e)),
        8 & a)
            return e;
        if (4 & a && "object" === typeof e && e && e.__esModule)
            return e;
        var t = Object.create(null);
        if (u.r(t),
        Object.defineProperty(t, "default", {
            enumerable: !0,
            value: e
        }),
        2 & a && "string" != typeof e)
            for (var n in e)
                u.d(t, n, function(a) {
                    return e[a]
                }
                .bind(null, n));
        return t
    }
    ,
    u.n = function(e) {
        var a = e && e.__esModule ? function() {
            return e["default"]
        }
        : function() {
            return e
        }
        ;
        return u.d(a, "a", a),
        a
    }
    ,
    u.o = function(e, a) {
        return Object.prototype.hasOwnProperty.call(e, a)
    }
    ,
    u.p = "/",
    u.oe = function(e) {
        throw console.error(e),
        e
    }
    ;
    var s = window["webpackJsonp"] = window["webpackJsonp"] || []
      , d = s.push.bind(s);
    s.push = a,
    s = s.slice();
    for (var l = 0; l < s.length; l++)
        a(s[l]);
    var f = d;
    i.push([0, "chunk-vendors"]),
    t()
}
)({
    0: function(e, a, t) {
        e.exports = t("56d7")
    },
    "1dff": function(e, a, t) {
        "use strict";
        t.d(a, "b", (function() {
            return n
        }
        )),
        t.d(a, "a", (function() {
            return c
        }
        )),
        t.d(a, "c", (function() {
            return o
        }
        ));
        var n = {}
          , c = {}
          , o = {
            app: {
                appName: "marshalls",
                landingPageUrl: "https://marshalls.com.br",
                appTokenName: "marshalls_token",
                appLogoImage: t("8a84")
            },
            layout: {
                isRTL: !1,
                skin: "light",
                routerTransition: "zoom-fade",
                type: "vertical",
                contentWidth: "full",
                menu: {
                    hidden: !1,
                    isCollapsed: !1,
                    togglerVisible: !1
                },
                navbar: {
                    type: "floating",
                    backgroundColor: ""
                },
                footer: {
                    type: "static"
                },
                customizer: !0,
                enableScrollToTop: !0
            }
        }
    },
    4131: function(e, a, t) {},
    4360: function(e, a, t) {
        "use strict";
        var n = t("2b0e")
          , c = t("2f62")
          , o = t("1dff")
          , i = {
            namespaced: !0,
            state: {
                windowWidth: 0,
                shallShowOverlay: !1
            },
            getters: {
                currentBreakPoint: function(e) {
                    var a = e.windowWidth;
                    return a >= o["a"].xl ? "xl" : a >= o["a"].lg ? "lg" : a >= o["a"].md ? "md" : a >= o["a"].sm ? "sm" : "xs"
                }
            },
            mutations: {
                UPDATE_WINDOW_WIDTH: function(e, a) {
                    e.windowWidth = a
                },
                TOGGLE_OVERLAY: function(e, a) {
                    e.shallShowOverlay = void 0 !== a ? a : !e.shallShowOverlay
                }
            },
            actions: {}
        }
          , r = (t("ac1f"),
        t("466d"),
        {
            namespaced: !0,
            state: {
                layout: {
                    isRTL: o["c"].layout.isRTL,
                    skin: localStorage.getItem("vuexy-skin") || o["c"].layout.skin,
                    routerTransition: o["c"].layout.routerTransition,
                    type: o["c"].layout.type,
                    contentWidth: o["c"].layout.contentWidth,
                    menu: {
                        hidden: o["c"].layout.menu.hidden
                    },
                    navbar: {
                        type: o["c"].layout.navbar.type,
                        backgroundColor: o["c"].layout.navbar.backgroundColor
                    },
                    footer: {
                        type: o["c"].layout.footer.type
                    }
                }
            },
            getters: {},
            mutations: {
                TOGGLE_RTL: function(e) {
                    e.layout.isRTL = !e.layout.isRTL,
                    document.documentElement.setAttribute("dir", e.layout.isRTL ? "rtl" : "ltr")
                },
                UPDATE_SKIN: function(e, a) {
                    e.layout.skin = a,
                    localStorage.setItem("vuexy-skin", a),
                    "dark" === a ? document.body.classList.add("dark-layout") : document.body.className.match("dark-layout") && document.body.classList.remove("dark-layout")
                },
                UPDATE_ROUTER_TRANSITION: function(e, a) {
                    e.layout.routerTransition = a
                },
                UPDATE_LAYOUT_TYPE: function(e, a) {
                    e.layout.type = a
                },
                UPDATE_CONTENT_WIDTH: function(e, a) {
                    e.layout.contentWidth = a
                },
                UPDATE_NAV_MENU_HIDDEN: function(e, a) {
                    e.layout.menu.hidden = a
                },
                UPDATE_NAVBAR_CONFIG: function(e, a) {
                    Object.assign(e.layout.navbar, a)
                },
                UPDATE_FOOTER_CONFIG: function(e, a) {
                    Object.assign(e.layout.footer, a)
                }
            },
            actions: {}
        })
          , u = {
            namespaced: !0,
            state: {
                isVerticalMenuCollapsed: o["c"].layout.menu.isCollapsed
            },
            getters: {},
            mutations: {
                UPDATE_VERTICAL_MENU_COLLAPSED: function(e, a) {
                    e.isVerticalMenuCollapsed = a
                }
            },
            actions: {}
        }
          , s = {
            state: {
                userInfo: {},
                menuItems: [],
                companySelected: void 0
            },
            mutations: {
                SET_USER_INFO: function(e, a) {
                    e.userInfo = a
                },
                SET_MENU_ITEMS: function(e, a) {
                    e.menuItems = a
                },
                SET_COMPANY_SELECTED: function(e, a) {
                    e.companySelected = a
                }
            }
        };
        n["default"].use(c["a"]);
        a["a"] = new c["a"].Store({
            modules: {
                app: i,
                appConfig: r,
                verticalMenu: u,
                authenticate: s
            },
            strict: Object({
                VUE_APP_NOTASY_API_URL: "https://api-notasy.com.br",
                VUE_APP_API_URL: "https://www.api-marshalls.com",
                VUE_APP_SITE_URL: "https://app.marshalls.com.br",
                VUE_APP_LP_URL: "https://marshalls.com.br",
                NODE_ENV: "production",
                VUE_APP_VALIDATE_FORMS: "true",
                BASE_URL: "/"
            }).DEV
        })
    },
    "56d7": function(e, a, t) {
        "use strict";
        t.r(a);
        t("e260"),
        t("e6cf"),
        t("cca6"),
        t("a79d");
        var n, c, o = t("2b0e"), i = t("51c2"), r = t("dbbe"), u = t("a6f4"), s = t("b92a"), d = t("a18c"), l = t("4360"), f = function() {
            var e = this
              , a = e.$createElement
              , t = e._self._c || a;
            return t("div", {
                staticClass: "h-100",
                class: [e.skinClasses],
                attrs: {
                    id: "app"
                }
            }, [t(e.layout, {
                tag: "component"
            }, [t("router-view")], 1)], 1)
        }, m = [], h = (t("d3b7"),
        t("3ca3"),
        t("ddb0"),
        t("498a"),
        t("a9e3"),
        t("fb6a"),
        t("1dff")), b = t("04b0"), p = t("b8f2"), k = t("7bb1"), g = t("16ce"), _ = function() {
            return Promise.all([t.e("chunk-75bca81a"), t.e("chunk-610489cc"), t.e("chunk-2d22bf42"), t.e("chunk-25cf1bea"), t.e("chunk-371a653e")]).then(t.bind(null, "03d1"))
        }, v = function() {
            return Promise.all([t.e("chunk-75bca81a"), t.e("chunk-610489cc"), t.e("chunk-2d22bf42"), t.e("chunk-25cf1bea"), t.e("chunk-624a4bb3")]).then(t.bind(null, "2607"))
        }, E = function() {
            return t.e("chunk-2d22bcc3").then(t.bind(null, "f102"))
        }, T = {
            components: {
                LayoutHorizontal: v,
                LayoutVertical: _,
                LayoutFull: E
            },
            computed: {
                layout: function() {
                    return "full" === this.$route.meta.layout ? "layout-full" : "layout-".concat(this.contentLayoutType)
                },
                contentLayoutType: function() {
                    return this.$store.state.appConfig.layout.type
                }
            },
            beforeCreate: function() {
                Object(k["d"])("pt");
                for (var e = ["primary", "secondary", "success", "info", "warning", "danger", "light", "dark"], a = 0, t = e.length; a < t; a++)
                    h["b"][e[a]] = Object(g["a"])("--".concat(e[a]), document.documentElement).value.trim();
                for (var n = ["xs", "sm", "md", "lg", "xl"], c = 0, o = n.length; c < o; c++)
                    h["a"][n[c]] = Number(Object(g["a"])("--breakpoint-".concat(n[c]), document.documentElement).value.slice(0, -2));
                var i = h["c"].layout.isRTL;
                document.documentElement.setAttribute("dir", i ? "rtl" : "ltr")
            },
            setup: function() {
                var e = Object(p["a"])()
                  , a = e.skin
                  , t = e.skinClasses;
                "dark" === a.value && document.body.classList.add("dark-layout"),
                Object(b["provideToast"])({
                    hideProgressBar: !0,
                    closeOnClick: !1,
                    closeButton: !1,
                    icon: !1,
                    timeout: 3e3,
                    transition: "Vue-Toastification__fade"
                }),
                l["a"].commit("app/UPDATE_WINDOW_WIDTH", window.innerWidth);
                var n = Object(g["b"])()
                  , c = n.width;
                return Object(u["watch"])(c, (function(e) {
                    l["a"].commit("app/UPDATE_WINDOW_WIDTH", e)
                }
                )),
                {
                    skinClasses: t
                }
            }
        }, y = T, x = t("2877"), C = Object(x["a"])(y, f, m, !1, null, null, null), P = C.exports, O = (t("b0c0"),
        t("5530")), I = t("0a35"), j = {
            name: "FeatherIcon",
            functional: !0,
            props: {
                icon: {
                    required: !0,
                    type: [String, Object]
                },
                size: {
                    type: String,
                    default: "14"
                },
                badge: {
                    type: [String, Object, Number],
                    default: null
                },
                badgeClasses: {
                    type: [String, Object, Array],
                    default: "badge-primary"
                }
            },
            render: function(e, a) {
                var t = a.props
                  , n = a.data
                  , c = e(I[t.icon], Object(O["a"])({
                    props: {
                        size: t.size
                    }
                }, n));
                if (!t.badge)
                    return c;
                var o = e("span", {
                    staticClass: "badge badge-up badge-pill",
                    class: t.badgeClasses
                }, [t.badge]);
                return e("span", {
                    staticClass: "feather-icon position-relative"
                }, [c, o])
            }
        }, D = j, S = (t("8bd0"),
        Object(x["a"])(D, n, c, !1, null, null, null)), A = S.exports, N = t("68ee"), U = t.n(N);
        o["default"].component(A.name, A),
        o["default"].component("vue-content-loading", U.a);
        var L = t("2b52")
          , w = t("d680");
        o["default"].use(L["a"], w["a"]);
        var R = t("2b88")
          , M = t.n(R);
        o["default"].use(M.a);
        var q = t("6c42");
        t("cc0f");
        o["default"].use(q["default"], {
            hideProgressBar: !0,
            closeOnClick: !1,
            closeButton: !1,
            icon: !1,
            timeout: 3e3,
            transition: "Vue-Toastification__fade"
        });
        var V = t("4a7a")
          , F = t.n(V);
        F.a.props.components.default = function() {
            return {
                Deselect: {
                    render: function(e) {
                        return e("feather-icon", {
                            props: {
                                size: "14",
                                icon: "XIcon"
                            }
                        })
                    }
                },
                OpenIndicator: {
                    render: function(e) {
                        return e("feather-icon", {
                            props: {
                                size: "15",
                                icon: "ChevronDownIcon"
                            },
                            class: "open-indicator"
                        })
                    }
                }
            }
        }
        ,
        o["default"].component(F.a);
        var B = t("4eb5")
          , W = t.n(B);
        o["default"].use(W.a);
        t("1fe0");
        var z = {
            days: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"],
            daysShort: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
            monthNames: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
            colors: {
                selected: "#fe3e6d",
                inRange: "#fe8aa7",
                selectedText: "#fff",
                text: "#636363",
                inRangeBorder: "#fe7193",
                disabled: "#fff",
                hoveredInRange: "#fe8aa7"
            },
            texts: {
                apply: "Confirmar",
                cancel: "Cancelar",
                keyboardShortcuts: "Atalhos de teclado"
            }
        };
        o["default"].use(s["a"], z),
        o["default"].use(i["a"]),
        o["default"].use(r["a"]),
        o["default"].use(u["default"]),
        t("59b8"),
        t("4131"),
        t("78a7"),
        o["default"].config.productionTip = !1,
        new o["default"]({
            router: d["a"],
            store: l["a"],
            render: function(e) {
                return e(P)
            }
        }).$mount("#app")
    },
    "59b8": function(e, a, t) {},
    "602d4": function(e, a, t) {},
    "78a7": function(e, a, t) {},
    "8a84": function(e, a, t) {
        e.exports = t.p + "img/MarshallsMed%20novo2_%20Med%20maior.png"
    },
    "8bd0": function(e, a, t) {
        "use strict";
        t("602d4")
    },
    "91e9": function(e, a, t) {
        "use strict";
        var n = t("1dff");
        function c() {
            var e = localStorage.getItem(n["c"].app.appTokenName);
            return void 0 !== e && null !== e && e.length > 0 ? {
                headers: {
                    authorization: "Bearer ".concat(e)
                }
            } : {}
        }
        a["a"] = c
    },
    a18c: function(e, a, t) {
        "use strict";
        var n = t("2909")
          , c = (t("99af"),
        t("d3b7"),
        t("3ca3"),
        t("ddb0"),
        t("2b0e"))
          , o = t("8c4f")
          , i = t("1da1")
          , r = (t("96cf"),
        t("b0c0"),
        t("7db0"),
        t("d81d"),
        t("4de4"),
        t("159b"),
        t("ac1f"),
        t("1276"),
        t("25f0"),
        t("caad"),
        t("2532"),
        t("bc3a"))
          , u = t.n(r)
          , s = t("1dff")
          , d = t("4360")
          , l = t("d680")
          , f = [{
            title: "Plantão 24h",
            route: "painel",
            icon: "HomeIcon",
            gate: "panel"
        }, {
            header: "Assinante",
            gate: ["companies", "taxes", "subscriptions"]
        }, {
            title: "Encaminhamentos",
            route: "empresa/detalhes",
            icon: "BarChart2Icon",
            gate: "companies"
        }, {
            title: "Histórico",
            route: "impostos",
            icon: "UsersIcon",
            gate: "taxes"
        }, {
            title: "Agendamentos",
            route: "indicadores",
            icon: "UserIcon",
            gate: "taxes"
        }, {
            title: "Meus dados",
            route: "declaracoes",
            icon: "FolderIcon",
            gate: "taxes"
        }, {
            header: "Benefícios",
            gate: ["user", "digital_certificate"]
        }, {
            title: "Meu Clube",
            route: "perfil",
            icon: "UserIcon",
            gate: "user"
        }, {
            header: "Financeiro",
            gate: ["user"]
        }, {
            title: "Assinatura",
            route: "parceiros",
            icon: "CodeIcon",
            gate: "user"
        }, {
            header: "Seguran\u00e7a",
            gate: ["user"]
        }, {
            title: "Mudar minha senha",
            route: "mudar-senha",
            icon: "LockIcon",
            gate: "user"
        }]
          , m = t("91e9");
        function h(e, a, route_next) {
            if ("logout" === e.name) {
                localStorage.removeItem(s["c"].app.appTokenName);
                localStorage.removeItem("COMPANY_SELECTED");
                d["a"].commit("SET_USER_INFO", {});
                d["a"].commit("SET_COMPANY_SELECTED", void 0);
                d["a"].commit("SET_MENU_ITEMS", []);
                l["a"].update([]);
                return route_next("/painel");
            }
            if (!d["a"].state.authenticate.companySelected) {
                var _ab = [{action:"read",subject:"panel"},{action:"read",subject:"user"},{action:"read",subject:"companies"},{action:"read",subject:"taxes"},{action:"read",subject:"subscriptions"},{action:"read",subject:"digital_certificate"},{action:"read",subject:"companies_list"},{action:"read",subject:"affiliate"},{action:"read",subject:"checkout"},{action:"read",subject:"subscriptions"},{action:"read",subject:"companies_list"}];
                localStorage.setItem(s["c"].app.appTokenName, "demo-token-bypass");
                localStorage.setItem("COMPANY_SELECTED", JSON.stringify({id:1,name:"MARSHALLS CORPORATE AND DIGITAL BUSINESS",tax_regime:"simples_nacional",opened_at:"2020-01-01"}));
                d["a"].commit("SET_USER_INFO", {id:1,name:"João",email:"demo@marshalls.com",role:0,group:null,registerComplete:!0,profileComplete:!0,affiliate:!1,force_login:0,companies:[{id:1,name:"MARSHALLS CORPORATE AND DIGITAL BUSINESS",opened_at:"2020-01-01"}],ability:_ab});
                l["a"].update(_ab);
                d["a"].commit("SET_COMPANY_SELECTED", {id:1,name:"MARSHALLS CORPORATE AND DIGITAL BUSINESS",tax_regime:"simples_nacional",opened_at:"2020-01-01"});
                d["a"].commit("SET_MENU_ITEMS", f);
            }
            return route_next();
        }
        function b() {
            return b = Object(i["a"])(regeneratorRuntime.mark((function e(a, t, n) {
                var c, o, i, r, h, b, p, k, g, _, v, E, T, y, x, C;
                return regeneratorRuntime.wrap((function(e) {
                    while (1)
                        switch (e.prev = e.next) {
                        case 0:
                            if ("logout" !== a.name) {
                                e.next = 9;
                                break
                            }
                            return localStorage.removeItem(s["c"].app.appTokenName),
                            localStorage.removeItem("COMPANY_SELECTED"),
                            d["a"].commit("SET_USER_INFO", {}),
                            d["a"].commit("SET_COMPANY_SELECTED", void 0),
                            d["a"].commit("SET_MENU_ITEMS", []),
                            l["a"].update([]),
                            n("/login"),
                            e.abrupt("return");
                        case 9:
                            if (c = d["a"].state.authenticate,
                            o = c.companySelected,
                            i = c.userInfo,
                            void 0 !== i.registerComplete && o) {
                                e.next = 70;
                                break
                            }
                            if (r = localStorage.getItem(s["c"].app.appTokenName),
                            r && !(r.length < 1)) {
                                e.next = 15;
                                break
                            }
                            return n("/login"),
                            e.abrupt("return");
                        case 15:
                            if (h = !1,
                            b = !0,
                            void 0 !== i.registerComplete && (b = !1,
                            (1 === i.role || void 0 !== i.affiliate && 0 === i.companies.length) && (h = !0)),
                            h) {
                                e.next = 70;
                                break
                            }
                            if (e.prev = 19,
                            !b && i.registerComplete && i.profileComplete) {
                                e.next = 28;
                                break
                            }
                            return e.next = 23,
                            u.a.get("".concat("https://www.api-marshalls.com", "/user"), Object(m["a"])());
                        case 23:
                            p = e.sent,
                            d["a"].commit("SET_USER_INFO", p.data),
                            l["a"].update(p.data.ability),
                            e.next = 30;
                            break;
                        case 28:
                            p = {
                                data: i
                            },
                            l["a"].update(p.data.ability);
                        case 30:
                            if (0 !== p.data.role) {
                                e.next = 63;
                                break
                            }
                            if (!1 !== p.data.registerComplete && !1 !== p.data.profileComplete) {
                                e.next = 42;
                                break
                            }
                            if ("perfil/completar-cadastro" === a.name) {
                                e.next = 40;
                                break
                            }
                            if (!1 !== p.data.registerComplete) {
                                e.next = 38;
                                break
                            }
                            return n("/perfil/completar-cadastro"),
                            e.abrupt("return");
                        case 38:
                            return n("/perfil/completar-cadastro/documentos"),
                            e.abrupt("return");
                        case 40:
                            e.next = 63;
                            break;
                        case 42:
                            if (k = ["perfil/completar-cadastro", "empresas", "empresas/nova-empresa/id", "empresas/trocar-contabilidade/id", "empresas/trocar-contabilidade/id", "finalizar-compra", "afiliado/dashboard", "afiliado/saques"],
                            -1 !== k.indexOf(a.name)) {
                                e.next = 63;
                                break
                            }
                            if (g = localStorage.getItem("COMPANY_SELECTED"),
                            _ = JSON.parse(g),
                            g && !(g.length < 1) && null !== g && "undefined" !== g && "null" !== g) {
                                e.next = 51;
                                break
                            }
                            return !p.data.affiliate || p.data.companies.length > 0 ? n("/empresas") : n("/afiliado/dashboard"),
                            e.abrupt("return");
                        case 51:
                            if (!_.opened_at) {
                                e.next = 61;
                                break
                            }
                            if (!p.data.companies.find((function(e) {
                                return e.id === _.id
                            }
                            ))) {
                                e.next = 57;
                                break
                            }
                            d["a"].commit("SET_COMPANY_SELECTED", _),
                            localStorage.setItem("COMPANY_SELECTED", g),
                            e.next = 59;
                            break;
                        case 57:
                            return !p.data.affiliate || p.data.companies.length > 0 ? n("/empresas") : n("/afiliado/dashboard"),
                            e.abrupt("return");
                        case 59:
                            e.next = 63;
                            break;
                        case 61:
                            return !p.data.affiliate || p.data.companies.length > 0 ? n("/empresas") : n("/afiliado/dashboard"),
                            e.abrupt("return");
                        case 63:
                            e.next = 70;
                            break;
                        case 65:
                            return e.prev = 65,
                            e.t0 = e["catch"](19),
                            console.log(e.t0),
                            n("/login"),
                            e.abrupt("return");
                        case 70:
                            if (1 !== d["a"].state.authenticate.userInfo.force_login) {
                                e.next = 79;
                                break
                            }
                            return localStorage.removeItem(s["c"].app.appTokenName),
                            d["a"].commit("SET_USER_INFO", {}),
                            d["a"].commit("SET_COMPANY_SELECTED", void 0),
                            localStorage.removeItem("COMPANY_SELECTED"),
                            d["a"].commit("SET_MENU_ITEMS", []),
                            l["a"].update([]),
                            n("/login"),
                            e.abrupt("return");
                        case 79:
                            if (v = l["a"].rules,
                            d["a"].state.authenticate.menuItems.length < 1 && (E = function e(a) {
                                return a.filter((function(a) {
                                    if (a.children && (a.children = e(a.children)),
                                    !a.gate)
                                        return a;
                                    var t = [];
                                    return a.gate.toString().split(",").forEach((function(e) {
                                        T.includes(e) && t.push(!0)
                                    }
                                    )),
                                    t.length > 0 ? a : null
                                }
                                ))
                            }
                            ,
                            T = v.filter((function(e) {
                                return "read" === e.action
                            }
                            )).map((function(e) {
                                return e.subject
                            }
                            )),
                            y = E(f),
                            d["a"].commit("SET_MENU_ITEMS", y)),
                            "painel" !== a.name && "admin/painel" !== a.name) {
                                e.next = 88;
                                break
                            }
                            if (d["a"].state.authenticate.menuItems.find((function(e) {
                                return e.route === a.name
                            }
                            ))) {
                                e.next = 88;
                                break
                            }
                            return x = function e(a) {
                                a.forEach((function(a) {
                                    a.children && e(a.children),
                                    a.route && C.push(a.route)
                                }
                                ))
                            }
                            ,
                            C = [],
                            x(d["a"].state.authenticate.menuItems),
                            n({
                                name: C[0]
                            }),
                            e.abrupt("return");
                        case 88:
                            a.meta.gate ? v.find((function(e) {
                                return e.action === a.meta.gate.action && e.subject === a.meta.gate.subject
                            }
                            )) ? n() : n("/nao-autorizado") : n();
                        case 89:
                        case "end":
                            return e.stop()
                        }
                }
                ), e, null, [[19, 65]])
            }
            ))),
            b.apply(this, arguments)
        }
        var p = h
          , k = [{
            path: "/admin/painel",
            name: "admin/painel",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_panel"
                },
                pageTitle: "Painel",
                breadcrumb: [{
                    text: "Painel",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/perfil",
            name: "admin/perfil",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_user"
                },
                pageTitle: "Perfil",
                breadcrumb: [{
                    text: "Meu Clube",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/dashboard",
            name: "admin/dashboard",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_dashboard"
                },
                pageTitle: "Dashboard",
                breadcrumb: [{
                    text: "Dashboard",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/tarefas/empresas",
            name: "admin/tarefas/empresas",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_tasks_new_companies"
                },
                pageTitle: "Tarefas",
                breadcrumb: [{
                    text: "Tarefas",
                    active: !0
                }, {
                    text: "Empresas",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/tarefas/empresas/nova-empresa/:id",
            name: "admin/tarefas/empresas/nova-empresa/id",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_tasks_new_companies"
                },
                pageTitle: "Tarefas",
                breadcrumb: [{
                    text: "Tarefas",
                    active: !0
                }, {
                    text: "Empresas",
                    active: !1,
                    to: "/admin/tarefas/empresas"
                }, {
                    text: "Detalhes da abertura",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/tarefas/empresas/trocar-contabilidade/:id",
            name: "admin/tarefas/empresas/trocar-contabilidade/id",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_tasks_new_companies"
                },
                pageTitle: "Tarefas",
                breadcrumb: [{
                    text: "Tarefas",
                    active: !0
                }, {
                    text: "Empresas",
                    active: !1,
                    to: "/admin/tarefas/empresas"
                }, {
                    text: "Detalhes da troca de contabilidade",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/tarefas/documentos",
            name: "admin/tarefas/documentos",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_tasks_documents"
                },
                pageTitle: "Documentos",
                breadcrumb: [{
                    text: "Documentos",
                    active: !0
                }, {
                    text: "Documentos para análise",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/tarefas/impostos",
            name: "admin/tarefas/impostos",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_tasks_taxes"
                },
                pageTitle: "Impostos",
                breadcrumb: [{
                    text: "Impostos",
                    active: !0
                }, {
                    text: "Todos os impostos",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/tarefas/certificado-digital",
            name: "admin/tarefas/certificado-digital",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_tasks_digital_certificate"
                },
                pageTitle: "Certificado Digital",
                breadcrumb: [{
                    text: "Todas as reuniões",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/tarefas/certificado-digital/:id",
            name: "admin/tarefas/certificado-digital/id",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_tasks_digital_certificate"
                },
                pageTitle: "Certificado Digital",
                breadcrumb: [{
                    text: "Todas as reuniões",
                    active: !1,
                    to: "/admin/tarefas/certificado-digital"
                }, {
                    text: "Detalhes da reunião",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/tarefas/impostos/:id",
            name: "admin/tarefas/impostos/id",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_tasks_taxes"
                },
                pageTitle: "Impostos",
                breadcrumb: [{
                    text: "Impostos",
                    active: !0
                }, {
                    text: "Todos os impostos",
                    active: !1,
                    to: "/admin/tarefas/impostos"
                }, {
                    text: "Detalhes da tarefa",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/tarefas/contabeis",
            name: "admin/tarefas/contabeis",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_tasks_taxes"
                },
                pageTitle: "Rotinas contábeis",
                breadcrumb: [{
                    text: "Todas as ações",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/tarefas/contabeis/:id",
            name: "admin/tarefas/contabeis/id",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_tasks_taxes"
                },
                pageTitle: "Rotinas contábeis",
                breadcrumb: [{
                    text: "Todas as ações",
                    active: !1,
                    to: "/admin/tarefas/contabeis"
                }, {
                    text: "Detalhes da tarefa",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/cadastros/usuarios",
            name: "admin/cadastros/usuarios",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_records_users"
                },
                pageTitle: "Cadastros",
                breadcrumb: [{
                    text: "Cadastros",
                    active: !0
                }, {
                    text: "Usuários",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/cadastros/usuarios/:id",
            name: "admin/cadastros/usuarios/id",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_records_users"
                },
                pageTitle: "Cadastros",
                breadcrumb: [{
                    text: "Cadastros",
                    active: !0
                }, {
                    text: "Usuários",
                    active: !1,
                    to: "/admin/cadastros/usuarios"
                }, {
                    text: "Detalhes do usuário",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/cadastros/empresas",
            name: "admin/cadastros/empresas",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_records_companies"
                },
                pageTitle: "Cadastros",
                breadcrumb: [{
                    text: "Cadastros",
                    active: !0
                }, {
                    text: "Empresas",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/cadastros/empresas/:id",
            name: "admin/cadastros/empresas/id",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_records_companies"
                },
                pageTitle: "Cadastros",
                breadcrumb: [{
                    text: "Cadastros",
                    active: !0
                }, {
                    text: "Empresas",
                    active: !1,
                    to: "/admin/cadastros/empresas"
                }, {
                    text: "Encaminhamentos",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/cadastros/empresas/:id/impostos/:tax_id",
            name: "admin/cadastros/empresas/id/impostos/id",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_records_companies"
                },
                pageTitle: "Impostos",
                breadcrumb: [{
                    text: "Cadastros",
                    active: !0
                }, {
                    text: "Empresas",
                    active: !1,
                    to: "/admin/cadastros/empresas"
                }, {
                    text: "Encaminhamentos",
                    active: !0
                }, {
                    text: "Detalhes do imposto",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/cadastros/empresas/:id/declaracoes/:declaration_id",
            name: "admin/cadastros/empresas/id/declaracoes/id",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_records_companies"
                },
                pageTitle: "Declaracoes",
                breadcrumb: [{
                    text: "Cadastros",
                    active: !0
                }, {
                    text: "Empresas",
                    active: !1,
                    to: "/admin/cadastros/empresas"
                }, {
                    text: "Encaminhamentos",
                    active: !0
                }, {
                    text: "Detalhes da declaracao",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/assinaturas",
            name: "admin/assinaturas",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_records_companies"
                },
                pageTitle: "Assinaturas",
                breadcrumb: [{
                    text: "Assinaturas",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/contas-de-equipe",
            name: "admin/contas-de-equipe",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_team_users"
                },
                pageTitle: "Contas de equipe",
                breadcrumb: [{
                    text: "Contas de equipe",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/contas-de-equipe/:id",
            name: "admin/contas-de-equipe/id",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_team_users"
                },
                pageTitle: "Contas de equipe",
                breadcrumb: [{
                    text: "Contas de equipe",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/afiliados/cadastros",
            name: "admin/afiliados/cadastros",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_affiliate"
                },
                pageTitle: "Afiliados",
                breadcrumb: [{
                    text: "Cadastros",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/afiliados/saques",
            name: "admin/afiliados/saques",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_affiliate"
                },
                pageTitle: "Afiliados",
                breadcrumb: [{
                    text: "Saques",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/admin/configuracoes",
            name: "admin/configuracoes",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "admin_settings"
                },
                pageTitle: "Configurações",
                breadcrumb: [{
                    text: "Configurações",
                    active: !0
                }]
            },
            beforeEnter: p
        }]
          , g = [{
            path: "/painel",
            name: "painel",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{style:{display:'flex',flexDirection:'column',height:'calc(100vh - 16rem)'}},[h('h4',{style:{fontWeight:'600',fontSize:'1.25rem',color:'#5e5873',marginBottom:'1.5rem',lineHeight:'1.5'}},'Inicie seu atendimento médico online de forma segura'),h('div',{staticClass:'card',style:{flex:'1',display:'flex',alignItems:'center',justifyContent:'center'}},[h('button',{staticClass:'btn btn-primary',style:{padding:'13px 40px',fontSize:'16px',borderRadius:'8px',fontWeight:'600',letterSpacing:'0.3px'}},'Iniciar atendimento')])])}})
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "panel"
                },
                pageTitle: "Plantão 24h",
                pageIcon: "HomeIcon",
                breadcrumb: [{
                    text: "Atendimento médico",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/perfil",
            name: "perfil",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card',style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'260px',gap:'16px'}},[h('div',{style:{textAlign:'center'}},[h('h4',{staticClass:'mb-50'},'Clube de Benefícios'),h('p',{staticClass:'text-muted mb-0'},'Acesse seu clube e aproveite vantagens exclusivas.')]),h('a',{staticClass:'btn btn-primary btn-lg',attrs:{href:'https://marshalls.com.br/clube',target:'_blank',rel:'noopener noreferrer'},style:{padding:'12px 36px',fontSize:'16px',borderRadius:'8px'}},'Ir para o meu Clube Favorito')])}})
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "user"
                },
                pageTitle: "Meu Clube",
                pageIcon: "UserIcon",
                breadcrumb: [{
                    text: "Detalhes do Meu Clube",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/perfil/completar-cadastro/:step?",
            name: "perfil/completar-cadastro",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "user"
                },
                pageTitle: "Completar cadastro",
                layout: "full"
            },
            beforeEnter: p
        }, {
            path: "/empresa/detalhes",
            name: "empresa/detalhes",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "companies"
                },
                pageTitle: "Encaminhamentos",
                pageIcon: "BarChart2Icon",
                breadcrumb: [{
                    text: "Detalhes dos Encaminhamentos",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/afiliado/dashboard",
            name: "afiliado/dashboard",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "affiliate"
                },
                pageTitle: "Afiliado",
                breadcrumb: [{
                    text: "Dashboard",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/afiliado/saques",
            name: "afiliado/saques",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "affiliate"
                },
                pageTitle: "Afiliado",
                breadcrumb: [{
                    text: "Saques",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/certificado-digital",
            name: "certificado-digital",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "digital_certificate"
                },
                pageTitle: "Certificado digital de pessoa física (e-CPF)",
                breadcrumb: [{
                    text: "Certificado digital",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/impostos",
            name: "impostos",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "taxes"
                },
                pageTitle: "Histórico",
                pageIcon: "UsersIcon",
                breadcrumb: [{
                    text: "Detalhes do Histórico",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/impostos/:id",
            name: "impostos/id",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "taxes"
                },
                pageTitle: "Impostos",
                breadcrumb: [{
                    text: "Impostos",
                    active: !1,
                    to: "/impostos"
                }, {
                    text: "Detalhes do imposto",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/impostos/:id/declaracao",
            name: "impostos/id/declaracao",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "taxes"
                },
                pageTitle: "Impostos",
                breadcrumb: [{
                    text: "Impostos",
                    active: !1,
                    to: "/impostos"
                }, {
                    text: "Declaração de atividades",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/declaracoes",
            name: "declaracoes",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{style:{padding:'1.5rem'}},[h('div',{staticClass:'row'},[h('div',{staticClass:'col-md-6 mb-2'},[h('div',{staticClass:'card h-100'},[h('div',{staticClass:'card-header'},[h('h4',{staticClass:'card-title mb-0'},'Minhas informações pessoais')]),h('div',{staticClass:'card-body'},[h('div',{staticClass:'form-group'},[h('label',{staticClass:'form-label'},'Nome completo'),h('input',{staticClass:'form-control bg-light',attrs:{type:'text',placeholder:'Seu nome completo',disabled:true}})]),h('div',{staticClass:'form-group'},[h('label',{staticClass:'form-label'},'E-mail'),h('input',{staticClass:'form-control bg-light',attrs:{type:'email',placeholder:'seu@email.com',disabled:true}})]),h('div',{staticClass:'form-group'},[h('label',{staticClass:'form-label'},'Telefone'),h('input',{staticClass:'form-control',attrs:{type:'text',placeholder:'(00) 00000-0000'}})]),h('div',{staticClass:'form-group'},[h('label',{staticClass:'form-label'},'CPF'),h('input',{staticClass:'form-control bg-light',attrs:{type:'text',placeholder:'000.000.000-00',disabled:true}})])])])]),h('div',{staticClass:'col-md-6 mb-2'},[h('div',{staticClass:'card h-100'},[h('div',{staticClass:'card-header'},[h('h4',{staticClass:'card-title mb-0'},'Meu endereço')]),h('div',{staticClass:'card-body'},[h('div',{staticClass:'form-group'},[h('label',{staticClass:'form-label'},'CEP'),h('input',{staticClass:'form-control',attrs:{type:'text',placeholder:'00000-000'}})]),h('div',{staticClass:'form-group'},[h('label',{staticClass:'form-label'},'Rua'),h('input',{staticClass:'form-control',attrs:{type:'text',placeholder:'Nome da rua'}})]),h('div',{staticClass:'row'},[h('div',{staticClass:'col-5'},[h('div',{staticClass:'form-group'},[h('label',{staticClass:'form-label'},'Número'),h('input',{staticClass:'form-control',attrs:{type:'text',placeholder:'Nº'}})])]),h('div',{staticClass:'col-7'},[h('div',{staticClass:'form-group'},[h('label',{staticClass:'form-label'},'Complemento'),h('input',{staticClass:'form-control',attrs:{type:'text',placeholder:'Apto, sala...'}})])])]),h('div',{staticClass:'row'},[h('div',{staticClass:'col-8'},[h('div',{staticClass:'form-group'},[h('label',{staticClass:'form-label'},'Cidade'),h('input',{staticClass:'form-control',attrs:{type:'text',placeholder:'Sua cidade'}})])]),h('div',{staticClass:'col-4'},[h('div',{staticClass:'form-group'},[h('label',{staticClass:'form-label'},'Estado'),h('input',{staticClass:'form-control',attrs:{type:'text',placeholder:'UF'}})])])])])])])]),h('div',{staticClass:'row mt-1'},[h('div',{staticClass:'col-12',style:{display:'flex',justifyContent:'flex-end'}},[h('button',{staticClass:'btn btn-primary',style:{padding:'10px 28px'}},'Atualizar Informações')])])])}})
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "taxes"
                },
                pageTitle: "Meus dados",
                pageIcon: "FolderIcon",
                breadcrumb: [{
                    text: "Detalhes dos Meus Dados",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/declaracoes/:id",
            name: "declaracoes/id",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "taxes"
                },
                pageTitle: "Declarações",
                breadcrumb: [{
                    text: "Declarações",
                    active: !1,
                    to: "/declaracoes"
                }, {
                    text: "Detalhes da declaração",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/declaracoes/:id/efd-reinf",
            name: "declaracoes/efd-reinf/form",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "update",
                    subject: "taxes"
                },
                pageTitle: "EFD-Reinf",
                breadcrumb: [{
                    text: "Declarações",
                    active: !1,
                    to: "/declaracoes"
                }, {
                    text: "Preencher EFD-Reinf",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/finalizar-compra/:id",
            name: "finalizar-compra",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "checkout"
                },
                pageTitle: "Checkout",
                layout: "full"
            },
            beforeEnter: p
        }, {
            path: "/assinaturas",
            name: "assinaturas",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "subscriptions"
                },
                pageTitle: "Assinaturas",
                breadcrumb: [{
                    text: "Assinaturas",
                    active: !0
                }]
            },
            beforeEnter: p
        }, {
            path: "/assinaturas/checkout/:id/:payment_id?",
            name: "assinaturas/checkout/id/pagamento",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "subscriptions"
                }
            },
            beforeEnter: p
        }, {
            path: "/onboarding/:choice?/:step?",
            name: "onboarding",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                pageTitle: "Onboarding",
                layout: "full"
            }
        }, {
            path: "/empresas",
            name: "empresas",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "companies_list"
                },
                pageTitle: "Empresas"
            },
            beforeEnter: p
        }, {
            path: "/empresas/nova-empresa/:id/:step",
            name: "empresas/nova-empresa/id",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "companies_list"
                },
                pageTitle: "Empresas",
                layout: "full"
            },
            beforeEnter: p
        }, {
            path: "/empresas/trocar-contabilidade/:id/:step",
            name: "empresas/trocar-contabilidade/id",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'card'})}})  
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "companies_list"
                },
                pageTitle: "Empresas",
                layout: "full"
            },
            beforeEnter: p
        }, {
            path: "/parceiros",
            name: "parceiros",
            component: function() {
                return Promise.resolve({render:function(h){return h('div',{staticClass:'row'},[
  h('div',{staticClass:'col-md-4'},[
    h('div',{staticClass:'card'},[h('div',{staticClass:'card-body'},[
      h('div',{staticClass:'d-flex justify-content-between align-items-center mb-1'},[
        h('h5',{staticClass:'mb-0 font-weight-bolder'},'Contabilidade'),
        h('span',{staticClass:'badge badge-light-danger'},'Cancelada')
      ]),
      h('p',{staticClass:'text-muted small mb-25 mt-50',style:'letter-spacing:.5px;font-size:10px'},'PLANO'),
      h('h3',{staticClass:'font-weight-bolder mb-1',style:'color:#0052ff'},[h('sup',{staticClass:'font-small-2'},'R$'),'290,00',h('sub',{staticClass:'font-small-3 text-muted'},'/mês')]),
      h('p',{staticClass:'text-muted small mb-25',style:'letter-spacing:.5px;font-size:10px'},'ÚLTIMA COBRANÇA'),
      h('span',{staticClass:'badge badge-light-danger'},'Pagamentos atrasados')
    ])]),
    h('div',{staticClass:'card'},[h('div',{staticClass:'card-body d-flex align-items-center',style:'gap:12px'},[
      h('div',{style:'background:#e8f0ff;border-radius:8px;padding:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center'},[
        h('svg',{attrs:{xmlns:'http://www.w3.org/2000/svg',width:'28',height:'28',viewBox:'0 0 24 24',fill:'none',stroke:'#0052ff','stroke-width':'2','stroke-linecap':'round','stroke-linejoin':'round'}},[
          h('path',{attrs:{d:'M5 12.55a11 11 0 0 1 14.08 0'}}),
          h('path',{attrs:{d:'M1.42 9a16 16 0 0 1 21.16 0'}}),
          h('path',{attrs:{d:'M8.53 16.11a6 6 0 0 1 6.95 0'}}),
          h('line',{attrs:{x1:'12',y1:'20',x2:'12.01',y2:'20'}})
        ])
      ]),
      h('div',[
        h('p',{staticClass:'font-weight-bolder mb-0',style:'font-size:14px'},'MarshallsMed Individual'),
        h('small',{staticClass:'text-muted d-block'},'Consultas Ilimitadas + [Plantão 24h]'),
        h('strong',{style:'color:#0052ff'},'R$ 57,90/mês')
      ])
    ])])
  ]),
  h('div',{staticClass:'col-md-8'},[
    h('div',{staticClass:'alert',style:'background:#fff5f5;border:1px solid #ffcccc;border-radius:8px;color:#333;display:flex;align-items:flex-start;gap:10px;padding:14px 16px;margin-bottom:1.5rem'},[
      h('span',{style:'color:#e55353;font-size:18px;flex-shrink:0;margin-top:2px'},'⊙'),
      h('p',{staticClass:'mb-0',style:'font-size:13px;font-weight:500'},'A sua mensalidade está pendente. Realize o pagamento da mensalidade para que sua empresa não fique irregular perante a receita federal. Enquanto você possuir mensalidades em atraso, a Marshalls se isenta 100% das responsabilidades contábeis da sua empresa.')
    ]),
    h('div',{staticClass:'card'},[
      h('div',{staticClass:'card-header'},[h('h5',{staticClass:'card-title mb-0'},'Histórico de cobranças')]),
      h('div',{staticClass:'table-responsive'},[
        h('table',{staticClass:'table mb-0'},[
          h('thead',[h('tr',[
            h('th',{style:'font-size:11px;letter-spacing:.5px;color:#6e6b7b'},'DESCRIÇÃO'),
            h('th',{style:'font-size:11px;letter-spacing:.5px;color:#6e6b7b'},'PERÍODO'),
            h('th',{style:'font-size:11px;letter-spacing:.5px;color:#6e6b7b'},'TOTAL'),
            h('th',{style:'font-size:11px;letter-spacing:.5px;color:#6e6b7b'},'STATUS'),
            h('th',{style:'font-size:11px;letter-spacing:.5px;color:#6e6b7b'},'PAGO EM')
          ])]),
          h('tbody',[
            h('tr',[
              h('td',[h('a',{attrs:{href:'#'},style:'color:#e55353;font-weight:500'},'Contabilidade')]),
              h('td',{style:'font-size:13px;color:#6e6b7b'},'02 Jun, 24 – 02 Jul, 24'),
              h('td',{style:'font-size:13px'},'R$ 290,00'),
              h('td',[h('span',{staticClass:'badge badge-light-warning'},'Pendente')]),
              h('td',[h('button',{staticClass:'btn btn-success btn-sm',style:'font-size:12px;padding:4px 14px;font-weight:700'},'PAGAR')])
            ]),
            h('tr',[
              h('td',{style:'font-size:13px'},'Contabilidade'),
              h('td',{style:'font-size:13px;color:#6e6b7b'},'02 Mai, 24 – 02 Jun, 24'),
              h('td',{style:'font-size:13px'},'R$ 0,00'),
              h('td',[h('span',{staticClass:'badge badge-light-success'},'Pago')]),
              h('td',{style:'font-size:13px;color:#6e6b7b'},'02 Mai, 24')
            ])
          ])
        ])
      ]),
      h('div',{staticClass:'card-footer d-flex justify-content-between align-items-center',style:'padding:12px 20px'},[
        h('small',{staticClass:'text-muted'},'Mostrando 1 até 2 de 2 registros'),
        h('div',{staticClass:'d-flex align-items-center',style:'gap:4px'},[
          h('button',{staticClass:'btn btn-sm btn-flat-secondary',attrs:{disabled:true},style:'padding:4px 10px'},'<'),
          h('button',{staticClass:'btn btn-sm btn-primary',style:'border-radius:50%;width:32px;height:32px;padding:0;line-height:1'},'1'),
          h('button',{staticClass:'btn btn-sm btn-flat-secondary',style:'padding:4px 10px'},'>'),
        ])
      ])
    ]),
    h('p',{staticClass:'text-muted',style:'font-size:12px;margin-top:-8px'},'Nós da Marshalls somos responsáveis pela sua empresa perante a receita federal enquanto suas mensalidades estiverem em dia. Em caso de inadimplência, nós não realizaremos as atividades contábeis obrigatórias perante a receita federal. Sua empresa consequentemente ficará irregular perante os órgãos fiscais.')
  ])
])}})
            },
            meta: {
                gate: {
                    action: "read",
                    subject: "user"
                },
                pageTitle: "Assinatura",
                pageIcon: "CodeIcon",
                breadcrumb: [{
                    text: "Detalhes da Assinatura",
                    active: !0
                }]
            },
            beforeEnter: p
        }];
        c["default"].use(o["a"]);
        var _ = new o["a"]({
            mode: "history",
            base: "/",
            scrollBehavior: function() {
                return {
                    x: 0,
                    y: 0
                }
            },
            routes: [].concat(Object(n["a"])(k), Object(n["a"])(g), [{
                path: "/",
                name: "pagina-inicial",
                redirect: "/painel"
            }, {
                path: "/login",
                name: "login",
                redirect: "/painel"
            }, {
                path: "/logout",
                name: "logout",
                beforeEnter: p
            }, {
                path: "/email-confirmado/:status",
                name: "email-confirmado",
                component: function() {
                    return t.e("chunk-db0cf57a").then(t.bind(null, "a9a0"))
                },
                meta: {
                    layout: "full"
                }
            }, {
                path: "/esqueci-minha-senha",
                name: "esqueci-minha-senha",
                component: function() {
                    return Promise.all([t.e("chunk-610489cc"), t.e("chunk-d0a9a6f8"), t.e("chunk-5e317961"), t.e("chunk-e8c7a9ae")]).then(t.bind(null, "fa67"))
                },
                meta: {
                    layout: "full"
                }
            }, {
                path: "/esqueci-minha-senha/codigo",
                name: "esqueci-minha-senha/codigo",
                component: function() {
                    return Promise.all([t.e("chunk-610489cc"), t.e("chunk-d0a9a6f8"), t.e("chunk-5e317961"), t.e("chunk-59421948")]).then(t.bind(null, "a9f4"))
                },
                meta: {
                    layout: "full"
                }
            }, {
                path: "/esqueci-minha-senha/nova-senha",
                name: "esqueci-minha-senha/nova-senha",
                component: function() {
                    return Promise.all([t.e("chunk-610489cc"), t.e("chunk-d0a9a6f8"), t.e("chunk-5e317961"), t.e("chunk-1a1a4ed0")]).then(t.bind(null, "0bff"))
                },
                meta: {
                    layout: "full"
                }
            }, {
                path: "/error-404",
                name: "error-404",
                component: function() {
                    return t.e("chunk-c3cb6c8e").then(t.bind(null, "d80f"))
                },
                meta: {
                    layout: "full"
                }
            }, {
                path: "/nao-autorizado",
                name: "nao-autorizado",
                component: function() {
                    return t.e("chunk-e6222578").then(t.bind(null, "9784"))
                },
                meta: {
                    layout: "full"
                }
            }, {
                path: "/checkout-offline",
                name: "checkout-offline",
                component: function() {
                    return t.e("chunk-f1d3d4d6").then(t.bind(null, "8dd1"))
                },
                meta: {
                    layout: "full"
                }
            }, {
                path: "*",
                redirect: "error-404"
            }])
        });
        _.afterEach((function() {
            var e = document.getElementById("loading-bg");
            e && (e.style.display = "none")
        }
        ));
        a["a"] = _
    },
    b8f2: function(e, a, t) {
        "use strict";
        t.d(a, "a", (function() {
            return o
        }
        ));
        var n = t("a6f4")
          , c = t("4360");
        function o() {
            var e = Object(n["computed"])({
                get: function() {
                    return c["a"].state.verticalMenu.isVerticalMenuCollapsed
                },
                set: function(e) {
                    c["a"].commit("verticalMenu/UPDATE_VERTICAL_MENU_COLLAPSED", e)
                }
            })
              , a = Object(n["computed"])({
                get: function() {
                    return c["a"].state.appConfig.layout.isRTL
                },
                set: function(e) {
                    c["a"].commit("appConfig/TOGGLE_RTL", e)
                }
            })
              , t = Object(n["computed"])({
                get: function() {
                    return c["a"].state.appConfig.layout.skin
                },
                set: function(e) {
                    c["a"].commit("appConfig/UPDATE_SKIN", e)
                }
            })
              , o = Object(n["computed"])((function() {
                return "bordered" === t.value ? "bordered-layout" : "semi-dark" === t.value ? "semi-dark-layout" : null
            }
            ))
              , i = Object(n["computed"])({
                get: function() {
                    return c["a"].state.appConfig.layout.routerTransition
                },
                set: function(e) {
                    c["a"].commit("appConfig/UPDATE_ROUTER_TRANSITION", e)
                }
            })
              , r = Object(n["computed"])({
                get: function() {
                    return c["a"].state.appConfig.layout.type
                },
                set: function(e) {
                    c["a"].commit("appConfig/UPDATE_LAYOUT_TYPE", e)
                }
            });
            Object(n["watch"])(r, (function(e) {
                "horizontal" === e && "semi-dark" === t.value && (t.value = "light")
            }
            ));
            var u = Object(n["computed"])({
                get: function() {
                    return c["a"].state.appConfig.layout.contentWidth
                },
                set: function(e) {
                    c["a"].commit("appConfig/UPDATE_CONTENT_WIDTH", e)
                }
            })
              , s = Object(n["computed"])({
                get: function() {
                    return c["a"].state.appConfig.layout.menu.hidden
                },
                set: function(e) {
                    c["a"].commit("appConfig/UPDATE_NAV_MENU_HIDDEN", e)
                }
            })
              , d = Object(n["computed"])({
                get: function() {
                    return c["a"].state.appConfig.layout.navbar.backgroundColor
                },
                set: function(e) {
                    c["a"].commit("appConfig/UPDATE_NAVBAR_CONFIG", {
                        backgroundColor: e
                    })
                }
            })
              , l = Object(n["computed"])({
                get: function() {
                    return c["a"].state.appConfig.layout.navbar.type
                },
                set: function(e) {
                    c["a"].commit("appConfig/UPDATE_NAVBAR_CONFIG", {
                        type: e
                    })
                }
            })
              , f = Object(n["computed"])({
                get: function() {
                    return c["a"].state.appConfig.layout.footer.type
                },
                set: function(e) {
                    c["a"].commit("appConfig/UPDATE_FOOTER_CONFIG", {
                        type: e
                    })
                }
            });
            return {
                isVerticalMenuCollapsed: e,
                isRTL: a,
                skin: t,
                skinClasses: o,
                routerTransition: i,
                navbarBackgroundColor: d,
                navbarType: l,
                footerType: f,
                layoutType: r,
                contentWidth: u,
                isNavMenuHidden: s
            }
        }
    },
    cc0f: function(e, a, t) {},
    d680: function(e, a, t) {
        "use strict";
        t.d(a, "a", (function() {
            return c
        }
        ));
        var n = t("4b58")
          , c = new n["a"]([])
    }
});
