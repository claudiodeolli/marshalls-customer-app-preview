(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["chunk-610489cc"], {
    4918: function(t, e, c) {
        "use strict";
        c.d(e, "b", (function() {
            return d
        }
        )),
        c.d(e, "a", (function() {
            return h
        }
        ));
        var n = c("2b0e")
          , r = c("b42e")
          , a = c("c637")
          , o = c("a723")
          , i = c("2326")
          , l = c("6c06")
          , b = c("7b1e")
          , u = c("3a58")
          , s = c("cf75")
          , O = c("fa73");
        function f(t, e, c) {
            return e in t ? Object.defineProperty(t, e, {
                value: c,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : t[e] = c,
            t
        }
        var j = '<svg width="%{w}" height="%{h}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %{w} %{h}" preserveAspectRatio="none"><rect width="100%" height="100%" style="fill:%{f};"></rect></svg>'
          , p = function(t, e, c) {
            var n = encodeURIComponent(j.replace("%{w}", Object(O["g"])(t)).replace("%{h}", Object(O["g"])(e)).replace("%{f}", c));
            return "data:image/svg+xml;charset=UTF-8,".concat(n)
        }
          , d = Object(s["d"])({
            alt: Object(s["c"])(o["t"]),
            blank: Object(s["c"])(o["g"], !1),
            blankColor: Object(s["c"])(o["t"], "transparent"),
            block: Object(s["c"])(o["g"], !1),
            center: Object(s["c"])(o["g"], !1),
            fluid: Object(s["c"])(o["g"], !1),
            fluidGrow: Object(s["c"])(o["g"], !1),
            height: Object(s["c"])(o["o"]),
            left: Object(s["c"])(o["g"], !1),
            right: Object(s["c"])(o["g"], !1),
            rounded: Object(s["c"])(o["j"], !1),
            sizes: Object(s["c"])(o["f"]),
            src: Object(s["c"])(o["t"]),
            srcset: Object(s["c"])(o["f"]),
            thumbnail: Object(s["c"])(o["g"], !1),
            width: Object(s["c"])(o["o"])
        }, a["M"])
          , h = n["default"].extend({
            name: a["M"],
            functional: !0,
            props: d,
            render: function(t, e) {
                var c, n = e.props, a = e.data, o = n.alt, s = n.src, j = n.block, d = n.fluidGrow, h = n.rounded, g = Object(u["c"])(n.width) || null, v = Object(u["c"])(n.height) || null, m = null, y = Object(i["b"])(n.srcset).filter(l["a"]).join(","), w = Object(i["b"])(n.sizes).filter(l["a"]).join(",");
                return n.blank && (!v && g ? v = g : !g && v && (g = v),
                g || v || (g = 1,
                v = 1),
                s = p(g, v, n.blankColor || "transparent"),
                y = null,
                w = null),
                n.left ? m = "float-left" : n.right ? m = "float-right" : n.center && (m = "mx-auto",
                j = !0),
                t("img", Object(r["a"])(a, {
                    attrs: {
                        src: s,
                        alt: o,
                        width: g ? Object(O["g"])(g) : null,
                        height: v ? Object(O["g"])(v) : null,
                        srcset: y || null,
                        sizes: w || null
                    },
                    class: (c = {
                        "img-thumbnail": n.thumbnail,
                        "img-fluid": n.fluid || d,
                        "w-100": d,
                        rounded: "" === h || !0 === h
                    },
                    f(c, "rounded-".concat(h), Object(b["m"])(h) && "" !== h),
                    f(c, m, m),
                    f(c, "d-block", j),
                    c)
                }))
            }
        })
    },
    7386: function(t, e, c) {
        "use strict";
        c.d(e, "a", (function() {
            return j
        }
        )),
        c.d(e, "b", (function() {
            return p
        }
        )),
        c.d(e, "c", (function() {
            return d
        }
        )),
        c.d(e, "d", (function() {
            return h
        }
        ));
        var n = c("2b0e")
          , r = c("b42e")
          , a = c("a723")
          , o = c("d82f")
          , i = c("cf75")
          , l = c("fa73")
          , b = c("aa0d");
        function u(t, e) {
            var c = Object.keys(t);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(t);
                e && (n = n.filter((function(e) {
                    return Object.getOwnPropertyDescriptor(t, e).enumerable
                }
                ))),
                c.push.apply(c, n)
            }
            return c
        }
        function s(t) {
            for (var e = 1; e < arguments.length; e++) {
                var c = null != arguments[e] ? arguments[e] : {};
                e % 2 ? u(Object(c), !0).forEach((function(e) {
                    O(t, e, c[e])
                }
                )) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(c)) : u(Object(c)).forEach((function(e) {
                    Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(c, e))
                }
                ))
            }
            return t
        }
        function O(t, e, c) {
            return e in t ? Object.defineProperty(t, e, {
                value: c,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : t[e] = c,
            t
        }
        var f = function(t, e) {
            var c = Object(l["b"])(t)
              , u = "BIcon".concat(Object(l["e"])(t))
              , O = "bi-".concat(c)
              , f = c.replace(/-/g, " ")
              , j = Object(l["h"])(e || "");
            return n["default"].extend({
                name: u,
                functional: !0,
                props: s(s({}, Object(o["j"])(b["b"], ["content", "stacked"])), {}, {
                    stacked: Object(i["c"])(a["g"], !1)
                }),
                render: function(t, e) {
                    var c = e.data
                      , n = e.props;
                    return t(b["a"], Object(r["a"])({
                        props: {
                            title: f
                        },
                        attrs: {
                            "aria-label": f
                        }
                    }, c, {
                        staticClass: O,
                        props: s(s({}, n), {}, {
                            content: j
                        })
                    }))
                }
            })
        }
          , j = f("Blank", "")
          , p = f("Dash", '<path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>')
          , d = f("PersonFill", '<path fill-rule="evenodd" d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>')
          , h = f("Plus", '<path fill-rule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>');
        /*!
 * BootstrapVue Icons, generated from Bootstrap Icons 1.2.1
 *
 * @link https://icons.getbootstrap.com/
 * @license MIT
 * https://github.com/twbs/icons/blob/master/LICENSE.md
 */
    },
    a15b7: function(t, e, c) {
        "use strict";
        c.d(e, "a", (function() {
            return y
        }
        ));
        var n = c("b42e")
          , r = c("c637")
          , a = c("a723")
          , o = c("2326")
          , i = c("228e")
          , l = c("6c06")
          , b = c("b508")
          , u = c("d82f")
          , s = c("cf75")
          , O = c("fa73");
        function f(t, e) {
            var c = Object.keys(t);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(t);
                e && (n = n.filter((function(e) {
                    return Object.getOwnPropertyDescriptor(t, e).enumerable
                }
                ))),
                c.push.apply(c, n)
            }
            return c
        }
        function j(t) {
            for (var e = 1; e < arguments.length; e++) {
                var c = null != arguments[e] ? arguments[e] : {};
                e % 2 ? f(Object(c), !0).forEach((function(e) {
                    p(t, e, c[e])
                }
                )) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(c)) : f(Object(c)).forEach((function(e) {
                    Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(c, e))
                }
                ))
            }
            return t
        }
        function p(t, e, c) {
            return e in t ? Object.defineProperty(t, e, {
                value: c,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : t[e] = c,
            t
        }
        var d = ["start", "end", "center"]
          , h = Object(b["a"])((function(t, e) {
            return e = Object(O["h"])(Object(O["g"])(e)),
            e ? Object(O["c"])(["row-cols", t, e].filter(l["a"]).join("-")) : null
        }
        ))
          , g = Object(b["a"])((function(t) {
            return Object(O["c"])(t.replace("cols", ""))
        }
        ))
          , v = []
          , m = function() {
            var t = Object(i["b"])().reduce((function(t, e) {
                return t[Object(s["g"])(e, "cols")] = Object(s["c"])(a["o"]),
                t
            }
            ), Object(u["c"])(null));
            return v = Object(u["h"])(t),
            Object(s["d"])(Object(u["m"])(j(j({}, t), {}, {
                alignContent: Object(s["c"])(a["t"], null, (function(t) {
                    return Object(o["a"])(Object(o["b"])(d, "between", "around", "stretch"), t)
                }
                )),
                alignH: Object(s["c"])(a["t"], null, (function(t) {
                    return Object(o["a"])(Object(o["b"])(d, "between", "around"), t)
                }
                )),
                alignV: Object(s["c"])(a["t"], null, (function(t) {
                    return Object(o["a"])(Object(o["b"])(d, "baseline", "stretch"), t)
                }
                )),
                noGutters: Object(s["c"])(a["g"], !1),
                tag: Object(s["c"])(a["t"], "div")
            })), r["lb"])
        }
          , y = {
            name: r["lb"],
            functional: !0,
            get props() {
                return delete this.props,
                this.props = m(),
                this.props
            },
            render: function(t, e) {
                var c, r = e.props, a = e.data, o = e.children, i = r.alignV, l = r.alignH, b = r.alignContent, u = [];
                return v.forEach((function(t) {
                    var e = h(g(t), r[t]);
                    e && u.push(e)
                }
                )),
                u.push((c = {
                    "no-gutters": r.noGutters
                },
                p(c, "align-items-".concat(i), i),
                p(c, "justify-content-".concat(l), l),
                p(c, "align-content-".concat(b), b),
                c)),
                t(r.tag, Object(n["a"])(a, {
                    staticClass: "row",
                    class: u
                }), o)
            }
        }
    },
    aa0d: function(t, e, c) {
        "use strict";
        c.d(e, "b", (function() {
            return p
        }
        )),
        c.d(e, "a", (function() {
            return d
        }
        ));
        var n = c("2b0e")
          , r = c("b42e")
          , a = c("c637")
          , o = c("a723")
          , i = c("6c06")
          , l = c("7b1e")
          , b = c("a8c8")
          , u = c("3a58")
          , s = c("cf75");
        function O(t, e, c) {
            return e in t ? Object.defineProperty(t, e, {
                value: c,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : t[e] = c,
            t
        }
        var f = {
            viewBox: "0 0 16 16",
            width: "1em",
            height: "1em",
            focusable: "false",
            role: "img",
            "aria-label": "icon"
        }
          , j = {
            width: null,
            height: null,
            focusable: null,
            role: null,
            "aria-label": null
        }
          , p = {
            animation: Object(s["c"])(o["t"]),
            content: Object(s["c"])(o["t"]),
            flipH: Object(s["c"])(o["g"], !1),
            flipV: Object(s["c"])(o["g"], !1),
            fontScale: Object(s["c"])(o["o"], 1),
            rotate: Object(s["c"])(o["o"], 0),
            scale: Object(s["c"])(o["o"], 1),
            shiftH: Object(s["c"])(o["o"], 0),
            shiftV: Object(s["c"])(o["o"], 0),
            stacked: Object(s["c"])(o["g"], !1),
            title: Object(s["c"])(o["t"]),
            variant: Object(s["c"])(o["t"])
        }
          , d = n["default"].extend({
            name: a["L"],
            functional: !0,
            props: p,
            render: function(t, e) {
                var c, n = e.data, a = e.props, o = e.children, s = a.animation, p = a.content, d = a.flipH, h = a.flipV, g = a.stacked, v = a.title, m = a.variant, y = Object(b["c"])(Object(u["b"])(a.fontScale, 1), 0) || 1, w = Object(b["c"])(Object(u["b"])(a.scale, 1), 0) || 1, P = Object(u["b"])(a.rotate, 0), S = Object(u["b"])(a.shiftH, 0), k = Object(u["b"])(a.shiftV, 0), z = d || h || 1 !== w, x = z || P, D = S || k, C = !Object(l["o"])(p), E = [x ? "translate(8 8)" : null, z ? "scale(".concat((d ? -1 : 1) * w, " ").concat((h ? -1 : 1) * w, ")") : null, P ? "rotate(".concat(P, ")") : null, x ? "translate(-8 -8)" : null].filter(i["a"]), V = t("g", {
                    attrs: {
                        transform: E.join(" ") || null
                    },
                    domProps: C ? {
                        innerHTML: p || ""
                    } : {}
                }, o);
                D && (V = t("g", {
                    attrs: {
                        transform: "translate(".concat(16 * S / 16, " ").concat(-16 * k / 16, ")")
                    }
                }, [V])),
                g && (V = t("g", {}, [V]));
                var G = v ? t("title", v) : null;
                return t("svg", Object(r["a"])({
                    staticClass: "b-icon bi",
                    class: (c = {},
                    O(c, "text-".concat(m), m),
                    O(c, "b-icon-animation-".concat(s), s),
                    c),
                    attrs: f,
                    style: g ? {} : {
                        fontSize: 1 === y ? null : "".concat(100 * y, "%")
                    }
                }, n, g ? {
                    attrs: j
                } : {}, {
                    attrs: {
                        xmlns: g ? null : "http://www.w3.org/2000/svg",
                        fill: "currentColor"
                    }
                }), [G, V])
            }
        })
    },
    b28b: function(t, e, c) {
        "use strict";
        c.d(e, "a", (function() {
            return P
        }
        ));
        var n = c("b42e")
          , r = c("c637")
          , a = c("a723")
          , o = c("992e")
          , i = c("2326")
          , l = c("228e")
          , b = c("6c06")
          , u = c("7b1e")
          , s = c("b508")
          , O = c("d82f")
          , f = c("cf75")
          , j = c("fa73");
        function p(t, e) {
            var c = Object.keys(t);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(t);
                e && (n = n.filter((function(e) {
                    return Object.getOwnPropertyDescriptor(t, e).enumerable
                }
                ))),
                c.push.apply(c, n)
            }
            return c
        }
        function d(t) {
            for (var e = 1; e < arguments.length; e++) {
                var c = null != arguments[e] ? arguments[e] : {};
                e % 2 ? p(Object(c), !0).forEach((function(e) {
                    h(t, e, c[e])
                }
                )) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(c)) : p(Object(c)).forEach((function(e) {
                    Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(c, e))
                }
                ))
            }
            return t
        }
        function h(t, e, c) {
            return e in t ? Object.defineProperty(t, e, {
                value: c,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : t[e] = c,
            t
        }
        var g = ["auto", "start", "end", "center", "baseline", "stretch"]
          , v = function(t, e, c) {
            var n = t;
            if (!Object(u["o"])(c) && !1 !== c)
                return e && (n += "-".concat(e)),
                "col" !== t || "" !== c && !0 !== c ? (n += "-".concat(c),
                Object(j["c"])(n)) : Object(j["c"])(n)
        }
          , m = Object(s["a"])(v)
          , y = Object(O["c"])(null)
          , w = function() {
            var t = Object(l["b"])().filter(b["a"])
              , e = t.reduce((function(t, e) {
                return t[e] = Object(f["c"])(a["i"]),
                t
            }
            ), Object(O["c"])(null))
              , c = t.reduce((function(t, e) {
                return t[Object(f["g"])(e, "offset")] = Object(f["c"])(a["o"]),
                t
            }
            ), Object(O["c"])(null))
              , n = t.reduce((function(t, e) {
                return t[Object(f["g"])(e, "order")] = Object(f["c"])(a["o"]),
                t
            }
            ), Object(O["c"])(null));
            return y = Object(O["a"])(Object(O["c"])(null), {
                col: Object(O["h"])(e),
                offset: Object(O["h"])(c),
                order: Object(O["h"])(n)
            }),
            Object(f["d"])(Object(O["m"])(d(d(d(d({}, e), c), n), {}, {
                alignSelf: Object(f["c"])(a["t"], null, (function(t) {
                    return Object(i["a"])(g, t)
                }
                )),
                col: Object(f["c"])(a["g"], !1),
                cols: Object(f["c"])(a["o"]),
                offset: Object(f["c"])(a["o"]),
                order: Object(f["c"])(a["o"]),
                tag: Object(f["c"])(a["t"], "div")
            })), r["q"])
        }
          , P = {
            name: r["q"],
            functional: !0,
            get props() {
                return delete this.props,
                this.props = w()
            },
            render: function(t, e) {
                var c, r = e.props, a = e.data, i = e.children, l = r.cols, b = r.offset, u = r.order, s = r.alignSelf, O = [];
                for (var f in y)
                    for (var j = y[f], p = 0; p < j.length; p++) {
                        var d = m(f, j[p].replace(f, ""), r[j[p]]);
                        d && O.push(d)
                    }
                var g = O.some((function(t) {
                    return o["c"].test(t)
                }
                ));
                return O.push((c = {
                    col: r.col || !g && !l
                },
                h(c, "col-".concat(l), l),
                h(c, "offset-".concat(b), b),
                h(c, "order-".concat(u), u),
                h(c, "align-self-".concat(s), s),
                c)),
                t(r.tag, Object(n["a"])(a, {
                    class: O
                }), i)
            }
        }
    },
    e8a3: function(t, e, c) {
        "use strict";
        c.d(e, "a", (function() {
            return M
        }
        ));
        var n = c("2b0e")
          , r = c("c637")
          , a = c("0056")
          , o = c("a723")
          , i = c("9b76")
          , l = c("7b1e")
          , b = c("3a58")
          , u = c("d82f")
          , s = c("cf75")
          , O = c("4a38")
          , f = c("8c18")
          , j = c("b42e")
          , p = c("992e")
          , d = c("fa73")
          , h = c("7386")
          , g = c("aa0d");
        function v(t, e) {
            var c = Object.keys(t);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(t);
                e && (n = n.filter((function(e) {
                    return Object.getOwnPropertyDescriptor(t, e).enumerable
                }
                ))),
                c.push.apply(c, n)
            }
            return c
        }
        function m(t) {
            for (var e = 1; e < arguments.length; e++) {
                var c = null != arguments[e] ? arguments[e] : {};
                e % 2 ? v(Object(c), !0).forEach((function(e) {
                    y(t, e, c[e])
                }
                )) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(c)) : v(Object(c)).forEach((function(e) {
                    Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(c, e))
                }
                ))
            }
            return t
        }
        function y(t, e, c) {
            return e in t ? Object.defineProperty(t, e, {
                value: c,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : t[e] = c,
            t
        }
        var w = function t(e, c) {
            if (!e)
                return null;
            var n = (e.$options || {}).components
              , r = n[c];
            return r || t(e.$parent, c)
        }
          , P = Object(s["d"])(Object(u["m"])(m(m({}, Object(u["j"])(g["b"], ["content", "stacked"])), {}, {
            icon: Object(s["c"])(o["t"]),
            stacked: Object(s["c"])(o["g"], !1)
        })), r["K"])
          , S = n["default"].extend({
            name: r["K"],
            functional: !0,
            props: P,
            render: function(t, e) {
                var c = e.data
                  , n = e.props
                  , r = e.parent
                  , a = Object(d["e"])(Object(d["h"])(n.icon || "")).replace(p["k"], "");
                return t(a && w(r, "BIcon".concat(a)) || h["a"], Object(j["a"])(c, {
                    props: m(m({}, n), {}, {
                        icon: null
                    })
                }))
            }
        })
          , k = c("1947")
          , z = c("aa59");
        function x(t, e) {
            var c = Object.keys(t);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(t);
                e && (n = n.filter((function(e) {
                    return Object.getOwnPropertyDescriptor(t, e).enumerable
                }
                ))),
                c.push.apply(c, n)
            }
            return c
        }
        function D(t) {
            for (var e = 1; e < arguments.length; e++) {
                var c = null != arguments[e] ? arguments[e] : {};
                e % 2 ? x(Object(c), !0).forEach((function(e) {
                    C(t, e, c[e])
                }
                )) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(c)) : x(Object(c)).forEach((function(e) {
                    Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(c, e))
                }
                ))
            }
            return t
        }
        function C(t, e, c) {
            return e in t ? Object.defineProperty(t, e, {
                value: c,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : t[e] = c,
            t
        }
        var E = "b-avatar"
          , V = ["sm", null, "lg"]
          , G = .4
          , A = .7 * G
          , H = function(t) {
            return t = Object(l["m"])(t) && Object(l["h"])(t) ? Object(b["b"])(t, 0) : t,
            Object(l["g"])(t) ? "".concat(t, "px") : t || null
        }
          , L = Object(u["j"])(z["b"], ["active", "event", "routerTag"])
          , T = Object(s["d"])(Object(u["m"])(D(D({}, L), {}, {
            alt: Object(s["c"])(o["t"], "avatar"),
            ariaLabel: Object(s["c"])(o["t"]),
            badge: Object(s["c"])(o["j"], !1),
            badgeLeft: Object(s["c"])(o["g"], !1),
            badgeOffset: Object(s["c"])(o["t"]),
            badgeTop: Object(s["c"])(o["g"], !1),
            badgeVariant: Object(s["c"])(o["t"], "primary"),
            button: Object(s["c"])(o["g"], !1),
            buttonType: Object(s["c"])(o["t"], "button"),
            icon: Object(s["c"])(o["t"]),
            rounded: Object(s["c"])(o["j"], !1),
            size: Object(s["c"])(o["o"]),
            square: Object(s["c"])(o["g"], !1),
            src: Object(s["c"])(o["t"]),
            text: Object(s["c"])(o["t"]),
            variant: Object(s["c"])(o["t"], "secondary")
        })), r["b"])
          , M = n["default"].extend({
            name: r["b"],
            mixins: [f["a"]],
            inject: {
                bvAvatarGroup: {
                    default: null
                }
            },
            props: T,
            data: function() {
                return {
                    localSrc: this.src || null
                }
            },
            computed: {
                computedSize: function() {
                    var t = this.bvAvatarGroup;
                    return H(t ? t.size : this.size)
                },
                computedVariant: function() {
                    var t = this.bvAvatarGroup;
                    return t && t.variant ? t.variant : this.variant
                },
                computedRounded: function() {
                    var t = this.bvAvatarGroup
                      , e = !(!t || !t.square) || this.square
                      , c = t && t.rounded ? t.rounded : this.rounded;
                    return e ? "0" : "" === c || (c || "circle")
                },
                fontStyle: function() {
                    var t = this.computedSize
                      , e = -1 === V.indexOf(t) ? "calc(".concat(t, " * ").concat(G, ")") : null;
                    return e ? {
                        fontSize: e
                    } : {}
                },
                marginStyle: function() {
                    var t = this.computedSize
                      , e = this.bvAvatarGroup
                      , c = e ? e.overlapScale : 0
                      , n = t && c ? "calc(".concat(t, " * -").concat(c, ")") : null;
                    return n ? {
                        marginLeft: n,
                        marginRight: n
                    } : {}
                },
                badgeStyle: function() {
                    var t = this.computedSize
                      , e = this.badgeTop
                      , c = this.badgeLeft
                      , n = this.badgeOffset
                      , r = n || "0px";
                    return {
                        fontSize: -1 === V.indexOf(t) ? "calc(".concat(t, " * ").concat(A, " )") : null,
                        top: e ? r : null,
                        bottom: e ? null : r,
                        left: c ? r : null,
                        right: c ? null : r
                    }
                }
            },
            watch: {
                src: function(t, e) {
                    t !== e && (this.localSrc = t || null)
                }
            },
            methods: {
                onImgError: function(t) {
                    this.localSrc = null,
                    this.$emit(a["w"], t)
                },
                onClick: function(t) {
                    this.$emit(a["f"], t)
                }
            },
            render: function(t) {
                var e, c = this.computedVariant, n = this.disabled, r = this.computedRounded, a = this.icon, o = this.localSrc, l = this.text, b = this.fontStyle, u = this.marginStyle, f = this.computedSize, j = this.button, p = this.buttonType, d = this.badge, g = this.badgeVariant, v = this.badgeStyle, m = !j && Object(O["d"])(this), y = j ? k["a"] : m ? z["a"] : "span", w = this.alt, P = this.ariaLabel || null, x = null;
                this.hasNormalizedSlot() ? x = t("span", {
                    staticClass: "b-avatar-custom"
                }, [this.normalizeSlot()]) : o ? (x = t("img", {
                    style: c ? {} : {
                        width: "100%",
                        height: "100%"
                    },
                    attrs: {
                        src: o,
                        alt: w
                    },
                    on: {
                        error: this.onImgError
                    }
                }),
                x = t("span", {
                    staticClass: "b-avatar-img"
                }, [x])) : x = a ? t(S, {
                    props: {
                        icon: a
                    },
                    attrs: {
                        "aria-hidden": "true",
                        alt: w
                    }
                }) : l ? t("span", {
                    staticClass: "b-avatar-text",
                    style: b
                }, [t("span", l)]) : t(h["c"], {
                    attrs: {
                        "aria-hidden": "true",
                        alt: w
                    }
                });
                var G = t()
                  , A = this.hasNormalizedSlot(i["c"]);
                if (d || "" === d || A) {
                    var H = !0 === d ? "" : d;
                    G = t("span", {
                        staticClass: "b-avatar-badge",
                        class: C({}, "badge-".concat(g), g),
                        style: v
                    }, [A ? this.normalizeSlot(i["c"]) : H])
                }
                var T = {
                    staticClass: E,
                    class: (e = {},
                    C(e, "".concat(E, "-").concat(f), f && -1 !== V.indexOf(f)),
                    C(e, "badge-".concat(c), !j && c),
                    C(e, "rounded", !0 === r),
                    C(e, "rounded-".concat(r), r && !0 !== r),
                    C(e, "disabled", n),
                    e),
                    style: D(D({}, u), {}, {
                        width: f,
                        height: f
                    }),
                    attrs: {
                        "aria-label": P || null
                    },
                    props: j ? {
                        variant: c,
                        disabled: n,
                        type: p
                    } : m ? Object(s["e"])(L, this) : {},
                    on: j || m ? {
                        click: this.onClick
                    } : {}
                };
                return t(y, T, [x, G])
            }
        })
    }
}]);
