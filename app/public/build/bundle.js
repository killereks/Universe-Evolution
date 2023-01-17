
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        const options = { direction: 'both' };
        let config = fn(node, params, options);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config(options);
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.55.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /*!
     *  decimal.js v10.4.3
     *  An arbitrary-precision Decimal type for JavaScript.
     *  https://github.com/MikeMcl/decimal.js
     *  Copyright (c) 2022 Michael Mclaughlin <M8ch88l@gmail.com>
     *  MIT Licence
     */


    // -----------------------------------  EDITABLE DEFAULTS  ------------------------------------ //


      // The maximum exponent magnitude.
      // The limit on the value of `toExpNeg`, `toExpPos`, `minE` and `maxE`.
    var EXP_LIMIT = 9e15,                      // 0 to 9e15

      // The limit on the value of `precision`, and on the value of the first argument to
      // `toDecimalPlaces`, `toExponential`, `toFixed`, `toPrecision` and `toSignificantDigits`.
      MAX_DIGITS = 1e9,                        // 0 to 1e9

      // Base conversion alphabet.
      NUMERALS = '0123456789abcdef',

      // The natural logarithm of 10 (1025 digits).
      LN10 = '2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058',

      // Pi (1025 digits).
      PI = '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789',


      // The initial configuration properties of the Decimal constructor.
      DEFAULTS = {

        // These values must be integers within the stated ranges (inclusive).
        // Most of these values can be changed at run-time using the `Decimal.config` method.

        // The maximum number of significant digits of the result of a calculation or base conversion.
        // E.g. `Decimal.config({ precision: 20 });`
        precision: 20,                         // 1 to MAX_DIGITS

        // The rounding mode used when rounding to `precision`.
        //
        // ROUND_UP         0 Away from zero.
        // ROUND_DOWN       1 Towards zero.
        // ROUND_CEIL       2 Towards +Infinity.
        // ROUND_FLOOR      3 Towards -Infinity.
        // ROUND_HALF_UP    4 Towards nearest neighbour. If equidistant, up.
        // ROUND_HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
        // ROUND_HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
        // ROUND_HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
        // ROUND_HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
        //
        // E.g.
        // `Decimal.rounding = 4;`
        // `Decimal.rounding = Decimal.ROUND_HALF_UP;`
        rounding: 4,                           // 0 to 8

        // The modulo mode used when calculating the modulus: a mod n.
        // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
        // The remainder (r) is calculated as: r = a - n * q.
        //
        // UP         0 The remainder is positive if the dividend is negative, else is negative.
        // DOWN       1 The remainder has the same sign as the dividend (JavaScript %).
        // FLOOR      3 The remainder has the same sign as the divisor (Python %).
        // HALF_EVEN  6 The IEEE 754 remainder function.
        // EUCLID     9 Euclidian division. q = sign(n) * floor(a / abs(n)). Always positive.
        //
        // Truncated division (1), floored division (3), the IEEE 754 remainder (6), and Euclidian
        // division (9) are commonly used for the modulus operation. The other rounding modes can also
        // be used, but they may not give useful results.
        modulo: 1,                             // 0 to 9

        // The exponent value at and beneath which `toString` returns exponential notation.
        // JavaScript numbers: -7
        toExpNeg: -7,                          // 0 to -EXP_LIMIT

        // The exponent value at and above which `toString` returns exponential notation.
        // JavaScript numbers: 21
        toExpPos:  21,                         // 0 to EXP_LIMIT

        // The minimum exponent value, beneath which underflow to zero occurs.
        // JavaScript numbers: -324  (5e-324)
        minE: -EXP_LIMIT,                      // -1 to -EXP_LIMIT

        // The maximum exponent value, above which overflow to Infinity occurs.
        // JavaScript numbers: 308  (1.7976931348623157e+308)
        maxE: EXP_LIMIT,                       // 1 to EXP_LIMIT

        // Whether to use cryptographically-secure random number generation, if available.
        crypto: false                          // true/false
      },


    // ----------------------------------- END OF EDITABLE DEFAULTS ------------------------------- //


      inexact, quadrant,
      external = true,

      decimalError = '[DecimalError] ',
      invalidArgument = decimalError + 'Invalid argument: ',
      precisionLimitExceeded = decimalError + 'Precision limit exceeded',
      cryptoUnavailable = decimalError + 'crypto unavailable',
      tag = '[object Decimal]',

      mathfloor = Math.floor,
      mathpow = Math.pow,

      isBinary = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i,
      isHex = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i,
      isOctal = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i,
      isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,

      BASE = 1e7,
      LOG_BASE = 7,
      MAX_SAFE_INTEGER = 9007199254740991,

      LN10_PRECISION = LN10.length - 1,
      PI_PRECISION = PI.length - 1,

      // Decimal.prototype object
      P = { toStringTag: tag };


    // Decimal prototype methods


    /*
     *  absoluteValue             abs
     *  ceil
     *  clampedTo                 clamp
     *  comparedTo                cmp
     *  cosine                    cos
     *  cubeRoot                  cbrt
     *  decimalPlaces             dp
     *  dividedBy                 div
     *  dividedToIntegerBy        divToInt
     *  equals                    eq
     *  floor
     *  greaterThan               gt
     *  greaterThanOrEqualTo      gte
     *  hyperbolicCosine          cosh
     *  hyperbolicSine            sinh
     *  hyperbolicTangent         tanh
     *  inverseCosine             acos
     *  inverseHyperbolicCosine   acosh
     *  inverseHyperbolicSine     asinh
     *  inverseHyperbolicTangent  atanh
     *  inverseSine               asin
     *  inverseTangent            atan
     *  isFinite
     *  isInteger                 isInt
     *  isNaN
     *  isNegative                isNeg
     *  isPositive                isPos
     *  isZero
     *  lessThan                  lt
     *  lessThanOrEqualTo         lte
     *  logarithm                 log
     *  [maximum]                 [max]
     *  [minimum]                 [min]
     *  minus                     sub
     *  modulo                    mod
     *  naturalExponential        exp
     *  naturalLogarithm          ln
     *  negated                   neg
     *  plus                      add
     *  precision                 sd
     *  round
     *  sine                      sin
     *  squareRoot                sqrt
     *  tangent                   tan
     *  times                     mul
     *  toBinary
     *  toDecimalPlaces           toDP
     *  toExponential
     *  toFixed
     *  toFraction
     *  toHexadecimal             toHex
     *  toNearest
     *  toNumber
     *  toOctal
     *  toPower                   pow
     *  toPrecision
     *  toSignificantDigits       toSD
     *  toString
     *  truncated                 trunc
     *  valueOf                   toJSON
     */


    /*
     * Return a new Decimal whose value is the absolute value of this Decimal.
     *
     */
    P.absoluteValue = P.abs = function () {
      var x = new this.constructor(this);
      if (x.s < 0) x.s = 1;
      return finalise(x);
    };


    /*
     * Return a new Decimal whose value is the value of this Decimal rounded to a whole number in the
     * direction of positive Infinity.
     *
     */
    P.ceil = function () {
      return finalise(new this.constructor(this), this.e + 1, 2);
    };


    /*
     * Return a new Decimal whose value is the value of this Decimal clamped to the range
     * delineated by `min` and `max`.
     *
     * min {number|string|Decimal}
     * max {number|string|Decimal}
     *
     */
    P.clampedTo = P.clamp = function (min, max) {
      var k,
        x = this,
        Ctor = x.constructor;
      min = new Ctor(min);
      max = new Ctor(max);
      if (!min.s || !max.s) return new Ctor(NaN);
      if (min.gt(max)) throw Error(invalidArgument + max);
      k = x.cmp(min);
      return k < 0 ? min : x.cmp(max) > 0 ? max : new Ctor(x);
    };


    /*
     * Return
     *   1    if the value of this Decimal is greater than the value of `y`,
     *  -1    if the value of this Decimal is less than the value of `y`,
     *   0    if they have the same value,
     *   NaN  if the value of either Decimal is NaN.
     *
     */
    P.comparedTo = P.cmp = function (y) {
      var i, j, xdL, ydL,
        x = this,
        xd = x.d,
        yd = (y = new x.constructor(y)).d,
        xs = x.s,
        ys = y.s;

      // Either NaN or ±Infinity?
      if (!xd || !yd) {
        return !xs || !ys ? NaN : xs !== ys ? xs : xd === yd ? 0 : !xd ^ xs < 0 ? 1 : -1;
      }

      // Either zero?
      if (!xd[0] || !yd[0]) return xd[0] ? xs : yd[0] ? -ys : 0;

      // Signs differ?
      if (xs !== ys) return xs;

      // Compare exponents.
      if (x.e !== y.e) return x.e > y.e ^ xs < 0 ? 1 : -1;

      xdL = xd.length;
      ydL = yd.length;

      // Compare digit by digit.
      for (i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i) {
        if (xd[i] !== yd[i]) return xd[i] > yd[i] ^ xs < 0 ? 1 : -1;
      }

      // Compare lengths.
      return xdL === ydL ? 0 : xdL > ydL ^ xs < 0 ? 1 : -1;
    };


    /*
     * Return a new Decimal whose value is the cosine of the value in radians of this Decimal.
     *
     * Domain: [-Infinity, Infinity]
     * Range: [-1, 1]
     *
     * cos(0)         = 1
     * cos(-0)        = 1
     * cos(Infinity)  = NaN
     * cos(-Infinity) = NaN
     * cos(NaN)       = NaN
     *
     */
    P.cosine = P.cos = function () {
      var pr, rm,
        x = this,
        Ctor = x.constructor;

      if (!x.d) return new Ctor(NaN);

      // cos(0) = cos(-0) = 1
      if (!x.d[0]) return new Ctor(1);

      pr = Ctor.precision;
      rm = Ctor.rounding;
      Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
      Ctor.rounding = 1;

      x = cosine(Ctor, toLessThanHalfPi(Ctor, x));

      Ctor.precision = pr;
      Ctor.rounding = rm;

      return finalise(quadrant == 2 || quadrant == 3 ? x.neg() : x, pr, rm, true);
    };


    /*
     *
     * Return a new Decimal whose value is the cube root of the value of this Decimal, rounded to
     * `precision` significant digits using rounding mode `rounding`.
     *
     *  cbrt(0)  =  0
     *  cbrt(-0) = -0
     *  cbrt(1)  =  1
     *  cbrt(-1) = -1
     *  cbrt(N)  =  N
     *  cbrt(-I) = -I
     *  cbrt(I)  =  I
     *
     * Math.cbrt(x) = (x < 0 ? -Math.pow(-x, 1/3) : Math.pow(x, 1/3))
     *
     */
    P.cubeRoot = P.cbrt = function () {
      var e, m, n, r, rep, s, sd, t, t3, t3plusx,
        x = this,
        Ctor = x.constructor;

      if (!x.isFinite() || x.isZero()) return new Ctor(x);
      external = false;

      // Initial estimate.
      s = x.s * mathpow(x.s * x, 1 / 3);

       // Math.cbrt underflow/overflow?
       // Pass x to Math.pow as integer, then adjust the exponent of the result.
      if (!s || Math.abs(s) == 1 / 0) {
        n = digitsToString(x.d);
        e = x.e;

        // Adjust n exponent so it is a multiple of 3 away from x exponent.
        if (s = (e - n.length + 1) % 3) n += (s == 1 || s == -2 ? '0' : '00');
        s = mathpow(n, 1 / 3);

        // Rarely, e may be one less than the result exponent value.
        e = mathfloor((e + 1) / 3) - (e % 3 == (e < 0 ? -1 : 2));

        if (s == 1 / 0) {
          n = '5e' + e;
        } else {
          n = s.toExponential();
          n = n.slice(0, n.indexOf('e') + 1) + e;
        }

        r = new Ctor(n);
        r.s = x.s;
      } else {
        r = new Ctor(s.toString());
      }

      sd = (e = Ctor.precision) + 3;

      // Halley's method.
      // TODO? Compare Newton's method.
      for (;;) {
        t = r;
        t3 = t.times(t).times(t);
        t3plusx = t3.plus(x);
        r = divide(t3plusx.plus(x).times(t), t3plusx.plus(t3), sd + 2, 1);

        // TODO? Replace with for-loop and checkRoundingDigits.
        if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
          n = n.slice(sd - 3, sd + 1);

          // The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or 4999
          // , i.e. approaching a rounding boundary, continue the iteration.
          if (n == '9999' || !rep && n == '4999') {

            // On the first iteration only, check to see if rounding up gives the exact result as the
            // nines may infinitely repeat.
            if (!rep) {
              finalise(t, e + 1, 0);

              if (t.times(t).times(t).eq(x)) {
                r = t;
                break;
              }
            }

            sd += 4;
            rep = 1;
          } else {

            // If the rounding digits are null, 0{0,4} or 50{0,3}, check for an exact result.
            // If not, then there are further digits and m will be truthy.
            if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

              // Truncate to the first rounding digit.
              finalise(r, e + 1, 1);
              m = !r.times(r).times(r).eq(x);
            }

            break;
          }
        }
      }

      external = true;

      return finalise(r, e, Ctor.rounding, m);
    };


    /*
     * Return the number of decimal places of the value of this Decimal.
     *
     */
    P.decimalPlaces = P.dp = function () {
      var w,
        d = this.d,
        n = NaN;

      if (d) {
        w = d.length - 1;
        n = (w - mathfloor(this.e / LOG_BASE)) * LOG_BASE;

        // Subtract the number of trailing zeros of the last word.
        w = d[w];
        if (w) for (; w % 10 == 0; w /= 10) n--;
        if (n < 0) n = 0;
      }

      return n;
    };


    /*
     *  n / 0 = I
     *  n / N = N
     *  n / I = 0
     *  0 / n = 0
     *  0 / 0 = N
     *  0 / N = N
     *  0 / I = 0
     *  N / n = N
     *  N / 0 = N
     *  N / N = N
     *  N / I = N
     *  I / n = I
     *  I / 0 = I
     *  I / N = N
     *  I / I = N
     *
     * Return a new Decimal whose value is the value of this Decimal divided by `y`, rounded to
     * `precision` significant digits using rounding mode `rounding`.
     *
     */
    P.dividedBy = P.div = function (y) {
      return divide(this, new this.constructor(y));
    };


    /*
     * Return a new Decimal whose value is the integer part of dividing the value of this Decimal
     * by the value of `y`, rounded to `precision` significant digits using rounding mode `rounding`.
     *
     */
    P.dividedToIntegerBy = P.divToInt = function (y) {
      var x = this,
        Ctor = x.constructor;
      return finalise(divide(x, new Ctor(y), 0, 1, 1), Ctor.precision, Ctor.rounding);
    };


    /*
     * Return true if the value of this Decimal is equal to the value of `y`, otherwise return false.
     *
     */
    P.equals = P.eq = function (y) {
      return this.cmp(y) === 0;
    };


    /*
     * Return a new Decimal whose value is the value of this Decimal rounded to a whole number in the
     * direction of negative Infinity.
     *
     */
    P.floor = function () {
      return finalise(new this.constructor(this), this.e + 1, 3);
    };


    /*
     * Return true if the value of this Decimal is greater than the value of `y`, otherwise return
     * false.
     *
     */
    P.greaterThan = P.gt = function (y) {
      return this.cmp(y) > 0;
    };


    /*
     * Return true if the value of this Decimal is greater than or equal to the value of `y`,
     * otherwise return false.
     *
     */
    P.greaterThanOrEqualTo = P.gte = function (y) {
      var k = this.cmp(y);
      return k == 1 || k === 0;
    };


    /*
     * Return a new Decimal whose value is the hyperbolic cosine of the value in radians of this
     * Decimal.
     *
     * Domain: [-Infinity, Infinity]
     * Range: [1, Infinity]
     *
     * cosh(x) = 1 + x^2/2! + x^4/4! + x^6/6! + ...
     *
     * cosh(0)         = 1
     * cosh(-0)        = 1
     * cosh(Infinity)  = Infinity
     * cosh(-Infinity) = Infinity
     * cosh(NaN)       = NaN
     *
     *  x        time taken (ms)   result
     * 1000      9                 9.8503555700852349694e+433
     * 10000     25                4.4034091128314607936e+4342
     * 100000    171               1.4033316802130615897e+43429
     * 1000000   3817              1.5166076984010437725e+434294
     * 10000000  abandoned after 2 minute wait
     *
     * TODO? Compare performance of cosh(x) = 0.5 * (exp(x) + exp(-x))
     *
     */
    P.hyperbolicCosine = P.cosh = function () {
      var k, n, pr, rm, len,
        x = this,
        Ctor = x.constructor,
        one = new Ctor(1);

      if (!x.isFinite()) return new Ctor(x.s ? 1 / 0 : NaN);
      if (x.isZero()) return one;

      pr = Ctor.precision;
      rm = Ctor.rounding;
      Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
      Ctor.rounding = 1;
      len = x.d.length;

      // Argument reduction: cos(4x) = 1 - 8cos^2(x) + 8cos^4(x) + 1
      // i.e. cos(x) = 1 - cos^2(x/4)(8 - 8cos^2(x/4))

      // Estimate the optimum number of times to use the argument reduction.
      // TODO? Estimation reused from cosine() and may not be optimal here.
      if (len < 32) {
        k = Math.ceil(len / 3);
        n = (1 / tinyPow(4, k)).toString();
      } else {
        k = 16;
        n = '2.3283064365386962890625e-10';
      }

      x = taylorSeries(Ctor, 1, x.times(n), new Ctor(1), true);

      // Reverse argument reduction
      var cosh2_x,
        i = k,
        d8 = new Ctor(8);
      for (; i--;) {
        cosh2_x = x.times(x);
        x = one.minus(cosh2_x.times(d8.minus(cosh2_x.times(d8))));
      }

      return finalise(x, Ctor.precision = pr, Ctor.rounding = rm, true);
    };


    /*
     * Return a new Decimal whose value is the hyperbolic sine of the value in radians of this
     * Decimal.
     *
     * Domain: [-Infinity, Infinity]
     * Range: [-Infinity, Infinity]
     *
     * sinh(x) = x + x^3/3! + x^5/5! + x^7/7! + ...
     *
     * sinh(0)         = 0
     * sinh(-0)        = -0
     * sinh(Infinity)  = Infinity
     * sinh(-Infinity) = -Infinity
     * sinh(NaN)       = NaN
     *
     * x        time taken (ms)
     * 10       2 ms
     * 100      5 ms
     * 1000     14 ms
     * 10000    82 ms
     * 100000   886 ms            1.4033316802130615897e+43429
     * 200000   2613 ms
     * 300000   5407 ms
     * 400000   8824 ms
     * 500000   13026 ms          8.7080643612718084129e+217146
     * 1000000  48543 ms
     *
     * TODO? Compare performance of sinh(x) = 0.5 * (exp(x) - exp(-x))
     *
     */
    P.hyperbolicSine = P.sinh = function () {
      var k, pr, rm, len,
        x = this,
        Ctor = x.constructor;

      if (!x.isFinite() || x.isZero()) return new Ctor(x);

      pr = Ctor.precision;
      rm = Ctor.rounding;
      Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
      Ctor.rounding = 1;
      len = x.d.length;

      if (len < 3) {
        x = taylorSeries(Ctor, 2, x, x, true);
      } else {

        // Alternative argument reduction: sinh(3x) = sinh(x)(3 + 4sinh^2(x))
        // i.e. sinh(x) = sinh(x/3)(3 + 4sinh^2(x/3))
        // 3 multiplications and 1 addition

        // Argument reduction: sinh(5x) = sinh(x)(5 + sinh^2(x)(20 + 16sinh^2(x)))
        // i.e. sinh(x) = sinh(x/5)(5 + sinh^2(x/5)(20 + 16sinh^2(x/5)))
        // 4 multiplications and 2 additions

        // Estimate the optimum number of times to use the argument reduction.
        k = 1.4 * Math.sqrt(len);
        k = k > 16 ? 16 : k | 0;

        x = x.times(1 / tinyPow(5, k));
        x = taylorSeries(Ctor, 2, x, x, true);

        // Reverse argument reduction
        var sinh2_x,
          d5 = new Ctor(5),
          d16 = new Ctor(16),
          d20 = new Ctor(20);
        for (; k--;) {
          sinh2_x = x.times(x);
          x = x.times(d5.plus(sinh2_x.times(d16.times(sinh2_x).plus(d20))));
        }
      }

      Ctor.precision = pr;
      Ctor.rounding = rm;

      return finalise(x, pr, rm, true);
    };


    /*
     * Return a new Decimal whose value is the hyperbolic tangent of the value in radians of this
     * Decimal.
     *
     * Domain: [-Infinity, Infinity]
     * Range: [-1, 1]
     *
     * tanh(x) = sinh(x) / cosh(x)
     *
     * tanh(0)         = 0
     * tanh(-0)        = -0
     * tanh(Infinity)  = 1
     * tanh(-Infinity) = -1
     * tanh(NaN)       = NaN
     *
     */
    P.hyperbolicTangent = P.tanh = function () {
      var pr, rm,
        x = this,
        Ctor = x.constructor;

      if (!x.isFinite()) return new Ctor(x.s);
      if (x.isZero()) return new Ctor(x);

      pr = Ctor.precision;
      rm = Ctor.rounding;
      Ctor.precision = pr + 7;
      Ctor.rounding = 1;

      return divide(x.sinh(), x.cosh(), Ctor.precision = pr, Ctor.rounding = rm);
    };


    /*
     * Return a new Decimal whose value is the arccosine (inverse cosine) in radians of the value of
     * this Decimal.
     *
     * Domain: [-1, 1]
     * Range: [0, pi]
     *
     * acos(x) = pi/2 - asin(x)
     *
     * acos(0)       = pi/2
     * acos(-0)      = pi/2
     * acos(1)       = 0
     * acos(-1)      = pi
     * acos(1/2)     = pi/3
     * acos(-1/2)    = 2*pi/3
     * acos(|x| > 1) = NaN
     * acos(NaN)     = NaN
     *
     */
    P.inverseCosine = P.acos = function () {
      var halfPi,
        x = this,
        Ctor = x.constructor,
        k = x.abs().cmp(1),
        pr = Ctor.precision,
        rm = Ctor.rounding;

      if (k !== -1) {
        return k === 0
          // |x| is 1
          ? x.isNeg() ? getPi(Ctor, pr, rm) : new Ctor(0)
          // |x| > 1 or x is NaN
          : new Ctor(NaN);
      }

      if (x.isZero()) return getPi(Ctor, pr + 4, rm).times(0.5);

      // TODO? Special case acos(0.5) = pi/3 and acos(-0.5) = 2*pi/3

      Ctor.precision = pr + 6;
      Ctor.rounding = 1;

      x = x.asin();
      halfPi = getPi(Ctor, pr + 4, rm).times(0.5);

      Ctor.precision = pr;
      Ctor.rounding = rm;

      return halfPi.minus(x);
    };


    /*
     * Return a new Decimal whose value is the inverse of the hyperbolic cosine in radians of the
     * value of this Decimal.
     *
     * Domain: [1, Infinity]
     * Range: [0, Infinity]
     *
     * acosh(x) = ln(x + sqrt(x^2 - 1))
     *
     * acosh(x < 1)     = NaN
     * acosh(NaN)       = NaN
     * acosh(Infinity)  = Infinity
     * acosh(-Infinity) = NaN
     * acosh(0)         = NaN
     * acosh(-0)        = NaN
     * acosh(1)         = 0
     * acosh(-1)        = NaN
     *
     */
    P.inverseHyperbolicCosine = P.acosh = function () {
      var pr, rm,
        x = this,
        Ctor = x.constructor;

      if (x.lte(1)) return new Ctor(x.eq(1) ? 0 : NaN);
      if (!x.isFinite()) return new Ctor(x);

      pr = Ctor.precision;
      rm = Ctor.rounding;
      Ctor.precision = pr + Math.max(Math.abs(x.e), x.sd()) + 4;
      Ctor.rounding = 1;
      external = false;

      x = x.times(x).minus(1).sqrt().plus(x);

      external = true;
      Ctor.precision = pr;
      Ctor.rounding = rm;

      return x.ln();
    };


    /*
     * Return a new Decimal whose value is the inverse of the hyperbolic sine in radians of the value
     * of this Decimal.
     *
     * Domain: [-Infinity, Infinity]
     * Range: [-Infinity, Infinity]
     *
     * asinh(x) = ln(x + sqrt(x^2 + 1))
     *
     * asinh(NaN)       = NaN
     * asinh(Infinity)  = Infinity
     * asinh(-Infinity) = -Infinity
     * asinh(0)         = 0
     * asinh(-0)        = -0
     *
     */
    P.inverseHyperbolicSine = P.asinh = function () {
      var pr, rm,
        x = this,
        Ctor = x.constructor;

      if (!x.isFinite() || x.isZero()) return new Ctor(x);

      pr = Ctor.precision;
      rm = Ctor.rounding;
      Ctor.precision = pr + 2 * Math.max(Math.abs(x.e), x.sd()) + 6;
      Ctor.rounding = 1;
      external = false;

      x = x.times(x).plus(1).sqrt().plus(x);

      external = true;
      Ctor.precision = pr;
      Ctor.rounding = rm;

      return x.ln();
    };


    /*
     * Return a new Decimal whose value is the inverse of the hyperbolic tangent in radians of the
     * value of this Decimal.
     *
     * Domain: [-1, 1]
     * Range: [-Infinity, Infinity]
     *
     * atanh(x) = 0.5 * ln((1 + x) / (1 - x))
     *
     * atanh(|x| > 1)   = NaN
     * atanh(NaN)       = NaN
     * atanh(Infinity)  = NaN
     * atanh(-Infinity) = NaN
     * atanh(0)         = 0
     * atanh(-0)        = -0
     * atanh(1)         = Infinity
     * atanh(-1)        = -Infinity
     *
     */
    P.inverseHyperbolicTangent = P.atanh = function () {
      var pr, rm, wpr, xsd,
        x = this,
        Ctor = x.constructor;

      if (!x.isFinite()) return new Ctor(NaN);
      if (x.e >= 0) return new Ctor(x.abs().eq(1) ? x.s / 0 : x.isZero() ? x : NaN);

      pr = Ctor.precision;
      rm = Ctor.rounding;
      xsd = x.sd();

      if (Math.max(xsd, pr) < 2 * -x.e - 1) return finalise(new Ctor(x), pr, rm, true);

      Ctor.precision = wpr = xsd - x.e;

      x = divide(x.plus(1), new Ctor(1).minus(x), wpr + pr, 1);

      Ctor.precision = pr + 4;
      Ctor.rounding = 1;

      x = x.ln();

      Ctor.precision = pr;
      Ctor.rounding = rm;

      return x.times(0.5);
    };


    /*
     * Return a new Decimal whose value is the arcsine (inverse sine) in radians of the value of this
     * Decimal.
     *
     * Domain: [-Infinity, Infinity]
     * Range: [-pi/2, pi/2]
     *
     * asin(x) = 2*atan(x/(1 + sqrt(1 - x^2)))
     *
     * asin(0)       = 0
     * asin(-0)      = -0
     * asin(1/2)     = pi/6
     * asin(-1/2)    = -pi/6
     * asin(1)       = pi/2
     * asin(-1)      = -pi/2
     * asin(|x| > 1) = NaN
     * asin(NaN)     = NaN
     *
     * TODO? Compare performance of Taylor series.
     *
     */
    P.inverseSine = P.asin = function () {
      var halfPi, k,
        pr, rm,
        x = this,
        Ctor = x.constructor;

      if (x.isZero()) return new Ctor(x);

      k = x.abs().cmp(1);
      pr = Ctor.precision;
      rm = Ctor.rounding;

      if (k !== -1) {

        // |x| is 1
        if (k === 0) {
          halfPi = getPi(Ctor, pr + 4, rm).times(0.5);
          halfPi.s = x.s;
          return halfPi;
        }

        // |x| > 1 or x is NaN
        return new Ctor(NaN);
      }

      // TODO? Special case asin(1/2) = pi/6 and asin(-1/2) = -pi/6

      Ctor.precision = pr + 6;
      Ctor.rounding = 1;

      x = x.div(new Ctor(1).minus(x.times(x)).sqrt().plus(1)).atan();

      Ctor.precision = pr;
      Ctor.rounding = rm;

      return x.times(2);
    };


    /*
     * Return a new Decimal whose value is the arctangent (inverse tangent) in radians of the value
     * of this Decimal.
     *
     * Domain: [-Infinity, Infinity]
     * Range: [-pi/2, pi/2]
     *
     * atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
     *
     * atan(0)         = 0
     * atan(-0)        = -0
     * atan(1)         = pi/4
     * atan(-1)        = -pi/4
     * atan(Infinity)  = pi/2
     * atan(-Infinity) = -pi/2
     * atan(NaN)       = NaN
     *
     */
    P.inverseTangent = P.atan = function () {
      var i, j, k, n, px, t, r, wpr, x2,
        x = this,
        Ctor = x.constructor,
        pr = Ctor.precision,
        rm = Ctor.rounding;

      if (!x.isFinite()) {
        if (!x.s) return new Ctor(NaN);
        if (pr + 4 <= PI_PRECISION) {
          r = getPi(Ctor, pr + 4, rm).times(0.5);
          r.s = x.s;
          return r;
        }
      } else if (x.isZero()) {
        return new Ctor(x);
      } else if (x.abs().eq(1) && pr + 4 <= PI_PRECISION) {
        r = getPi(Ctor, pr + 4, rm).times(0.25);
        r.s = x.s;
        return r;
      }

      Ctor.precision = wpr = pr + 10;
      Ctor.rounding = 1;

      // TODO? if (x >= 1 && pr <= PI_PRECISION) atan(x) = halfPi * x.s - atan(1 / x);

      // Argument reduction
      // Ensure |x| < 0.42
      // atan(x) = 2 * atan(x / (1 + sqrt(1 + x^2)))

      k = Math.min(28, wpr / LOG_BASE + 2 | 0);

      for (i = k; i; --i) x = x.div(x.times(x).plus(1).sqrt().plus(1));

      external = false;

      j = Math.ceil(wpr / LOG_BASE);
      n = 1;
      x2 = x.times(x);
      r = new Ctor(x);
      px = x;

      // atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
      for (; i !== -1;) {
        px = px.times(x2);
        t = r.minus(px.div(n += 2));

        px = px.times(x2);
        r = t.plus(px.div(n += 2));

        if (r.d[j] !== void 0) for (i = j; r.d[i] === t.d[i] && i--;);
      }

      if (k) r = r.times(2 << (k - 1));

      external = true;

      return finalise(r, Ctor.precision = pr, Ctor.rounding = rm, true);
    };


    /*
     * Return true if the value of this Decimal is a finite number, otherwise return false.
     *
     */
    P.isFinite = function () {
      return !!this.d;
    };


    /*
     * Return true if the value of this Decimal is an integer, otherwise return false.
     *
     */
    P.isInteger = P.isInt = function () {
      return !!this.d && mathfloor(this.e / LOG_BASE) > this.d.length - 2;
    };


    /*
     * Return true if the value of this Decimal is NaN, otherwise return false.
     *
     */
    P.isNaN = function () {
      return !this.s;
    };


    /*
     * Return true if the value of this Decimal is negative, otherwise return false.
     *
     */
    P.isNegative = P.isNeg = function () {
      return this.s < 0;
    };


    /*
     * Return true if the value of this Decimal is positive, otherwise return false.
     *
     */
    P.isPositive = P.isPos = function () {
      return this.s > 0;
    };


    /*
     * Return true if the value of this Decimal is 0 or -0, otherwise return false.
     *
     */
    P.isZero = function () {
      return !!this.d && this.d[0] === 0;
    };


    /*
     * Return true if the value of this Decimal is less than `y`, otherwise return false.
     *
     */
    P.lessThan = P.lt = function (y) {
      return this.cmp(y) < 0;
    };


    /*
     * Return true if the value of this Decimal is less than or equal to `y`, otherwise return false.
     *
     */
    P.lessThanOrEqualTo = P.lte = function (y) {
      return this.cmp(y) < 1;
    };


    /*
     * Return the logarithm of the value of this Decimal to the specified base, rounded to `precision`
     * significant digits using rounding mode `rounding`.
     *
     * If no base is specified, return log[10](arg).
     *
     * log[base](arg) = ln(arg) / ln(base)
     *
     * The result will always be correctly rounded if the base of the log is 10, and 'almost always'
     * otherwise:
     *
     * Depending on the rounding mode, the result may be incorrectly rounded if the first fifteen
     * rounding digits are [49]99999999999999 or [50]00000000000000. In that case, the maximum error
     * between the result and the correctly rounded result will be one ulp (unit in the last place).
     *
     * log[-b](a)       = NaN
     * log[0](a)        = NaN
     * log[1](a)        = NaN
     * log[NaN](a)      = NaN
     * log[Infinity](a) = NaN
     * log[b](0)        = -Infinity
     * log[b](-0)       = -Infinity
     * log[b](-a)       = NaN
     * log[b](1)        = 0
     * log[b](Infinity) = Infinity
     * log[b](NaN)      = NaN
     *
     * [base] {number|string|Decimal} The base of the logarithm.
     *
     */
    P.logarithm = P.log = function (base) {
      var isBase10, d, denominator, k, inf, num, sd, r,
        arg = this,
        Ctor = arg.constructor,
        pr = Ctor.precision,
        rm = Ctor.rounding,
        guard = 5;

      // Default base is 10.
      if (base == null) {
        base = new Ctor(10);
        isBase10 = true;
      } else {
        base = new Ctor(base);
        d = base.d;

        // Return NaN if base is negative, or non-finite, or is 0 or 1.
        if (base.s < 0 || !d || !d[0] || base.eq(1)) return new Ctor(NaN);

        isBase10 = base.eq(10);
      }

      d = arg.d;

      // Is arg negative, non-finite, 0 or 1?
      if (arg.s < 0 || !d || !d[0] || arg.eq(1)) {
        return new Ctor(d && !d[0] ? -1 / 0 : arg.s != 1 ? NaN : d ? 0 : 1 / 0);
      }

      // The result will have a non-terminating decimal expansion if base is 10 and arg is not an
      // integer power of 10.
      if (isBase10) {
        if (d.length > 1) {
          inf = true;
        } else {
          for (k = d[0]; k % 10 === 0;) k /= 10;
          inf = k !== 1;
        }
      }

      external = false;
      sd = pr + guard;
      num = naturalLogarithm(arg, sd);
      denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);

      // The result will have 5 rounding digits.
      r = divide(num, denominator, sd, 1);

      // If at a rounding boundary, i.e. the result's rounding digits are [49]9999 or [50]0000,
      // calculate 10 further digits.
      //
      // If the result is known to have an infinite decimal expansion, repeat this until it is clear
      // that the result is above or below the boundary. Otherwise, if after calculating the 10
      // further digits, the last 14 are nines, round up and assume the result is exact.
      // Also assume the result is exact if the last 14 are zero.
      //
      // Example of a result that will be incorrectly rounded:
      // log[1048576](4503599627370502) = 2.60000000000000009610279511444746...
      // The above result correctly rounded using ROUND_CEIL to 1 decimal place should be 2.7, but it
      // will be given as 2.6 as there are 15 zeros immediately after the requested decimal place, so
      // the exact result would be assumed to be 2.6, which rounded using ROUND_CEIL to 1 decimal
      // place is still 2.6.
      if (checkRoundingDigits(r.d, k = pr, rm)) {

        do {
          sd += 10;
          num = naturalLogarithm(arg, sd);
          denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
          r = divide(num, denominator, sd, 1);

          if (!inf) {

            // Check for 14 nines from the 2nd rounding digit, as the first may be 4.
            if (+digitsToString(r.d).slice(k + 1, k + 15) + 1 == 1e14) {
              r = finalise(r, pr + 1, 0);
            }

            break;
          }
        } while (checkRoundingDigits(r.d, k += 10, rm));
      }

      external = true;

      return finalise(r, pr, rm);
    };


    /*
     * Return a new Decimal whose value is the maximum of the arguments and the value of this Decimal.
     *
     * arguments {number|string|Decimal}
     *
    P.max = function () {
      Array.prototype.push.call(arguments, this);
      return maxOrMin(this.constructor, arguments, 'lt');
    };
     */


    /*
     * Return a new Decimal whose value is the minimum of the arguments and the value of this Decimal.
     *
     * arguments {number|string|Decimal}
     *
    P.min = function () {
      Array.prototype.push.call(arguments, this);
      return maxOrMin(this.constructor, arguments, 'gt');
    };
     */


    /*
     *  n - 0 = n
     *  n - N = N
     *  n - I = -I
     *  0 - n = -n
     *  0 - 0 = 0
     *  0 - N = N
     *  0 - I = -I
     *  N - n = N
     *  N - 0 = N
     *  N - N = N
     *  N - I = N
     *  I - n = I
     *  I - 0 = I
     *  I - N = N
     *  I - I = N
     *
     * Return a new Decimal whose value is the value of this Decimal minus `y`, rounded to `precision`
     * significant digits using rounding mode `rounding`.
     *
     */
    P.minus = P.sub = function (y) {
      var d, e, i, j, k, len, pr, rm, xd, xe, xLTy, yd,
        x = this,
        Ctor = x.constructor;

      y = new Ctor(y);

      // If either is not finite...
      if (!x.d || !y.d) {

        // Return NaN if either is NaN.
        if (!x.s || !y.s) y = new Ctor(NaN);

        // Return y negated if x is finite and y is ±Infinity.
        else if (x.d) y.s = -y.s;

        // Return x if y is finite and x is ±Infinity.
        // Return x if both are ±Infinity with different signs.
        // Return NaN if both are ±Infinity with the same sign.
        else y = new Ctor(y.d || x.s !== y.s ? x : NaN);

        return y;
      }

      // If signs differ...
      if (x.s != y.s) {
        y.s = -y.s;
        return x.plus(y);
      }

      xd = x.d;
      yd = y.d;
      pr = Ctor.precision;
      rm = Ctor.rounding;

      // If either is zero...
      if (!xd[0] || !yd[0]) {

        // Return y negated if x is zero and y is non-zero.
        if (yd[0]) y.s = -y.s;

        // Return x if y is zero and x is non-zero.
        else if (xd[0]) y = new Ctor(x);

        // Return zero if both are zero.
        // From IEEE 754 (2008) 6.3: 0 - 0 = -0 - -0 = -0 when rounding to -Infinity.
        else return new Ctor(rm === 3 ? -0 : 0);

        return external ? finalise(y, pr, rm) : y;
      }

      // x and y are finite, non-zero numbers with the same sign.

      // Calculate base 1e7 exponents.
      e = mathfloor(y.e / LOG_BASE);
      xe = mathfloor(x.e / LOG_BASE);

      xd = xd.slice();
      k = xe - e;

      // If base 1e7 exponents differ...
      if (k) {
        xLTy = k < 0;

        if (xLTy) {
          d = xd;
          k = -k;
          len = yd.length;
        } else {
          d = yd;
          e = xe;
          len = xd.length;
        }

        // Numbers with massively different exponents would result in a very high number of
        // zeros needing to be prepended, but this can be avoided while still ensuring correct
        // rounding by limiting the number of zeros to `Math.ceil(pr / LOG_BASE) + 2`.
        i = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;

        if (k > i) {
          k = i;
          d.length = 1;
        }

        // Prepend zeros to equalise exponents.
        d.reverse();
        for (i = k; i--;) d.push(0);
        d.reverse();

      // Base 1e7 exponents equal.
      } else {

        // Check digits to determine which is the bigger number.

        i = xd.length;
        len = yd.length;
        xLTy = i < len;
        if (xLTy) len = i;

        for (i = 0; i < len; i++) {
          if (xd[i] != yd[i]) {
            xLTy = xd[i] < yd[i];
            break;
          }
        }

        k = 0;
      }

      if (xLTy) {
        d = xd;
        xd = yd;
        yd = d;
        y.s = -y.s;
      }

      len = xd.length;

      // Append zeros to `xd` if shorter.
      // Don't add zeros to `yd` if shorter as subtraction only needs to start at `yd` length.
      for (i = yd.length - len; i > 0; --i) xd[len++] = 0;

      // Subtract yd from xd.
      for (i = yd.length; i > k;) {

        if (xd[--i] < yd[i]) {
          for (j = i; j && xd[--j] === 0;) xd[j] = BASE - 1;
          --xd[j];
          xd[i] += BASE;
        }

        xd[i] -= yd[i];
      }

      // Remove trailing zeros.
      for (; xd[--len] === 0;) xd.pop();

      // Remove leading zeros and adjust exponent accordingly.
      for (; xd[0] === 0; xd.shift()) --e;

      // Zero?
      if (!xd[0]) return new Ctor(rm === 3 ? -0 : 0);

      y.d = xd;
      y.e = getBase10Exponent(xd, e);

      return external ? finalise(y, pr, rm) : y;
    };


    /*
     *   n % 0 =  N
     *   n % N =  N
     *   n % I =  n
     *   0 % n =  0
     *  -0 % n = -0
     *   0 % 0 =  N
     *   0 % N =  N
     *   0 % I =  0
     *   N % n =  N
     *   N % 0 =  N
     *   N % N =  N
     *   N % I =  N
     *   I % n =  N
     *   I % 0 =  N
     *   I % N =  N
     *   I % I =  N
     *
     * Return a new Decimal whose value is the value of this Decimal modulo `y`, rounded to
     * `precision` significant digits using rounding mode `rounding`.
     *
     * The result depends on the modulo mode.
     *
     */
    P.modulo = P.mod = function (y) {
      var q,
        x = this,
        Ctor = x.constructor;

      y = new Ctor(y);

      // Return NaN if x is ±Infinity or NaN, or y is NaN or ±0.
      if (!x.d || !y.s || y.d && !y.d[0]) return new Ctor(NaN);

      // Return x if y is ±Infinity or x is ±0.
      if (!y.d || x.d && !x.d[0]) {
        return finalise(new Ctor(x), Ctor.precision, Ctor.rounding);
      }

      // Prevent rounding of intermediate calculations.
      external = false;

      if (Ctor.modulo == 9) {

        // Euclidian division: q = sign(y) * floor(x / abs(y))
        // result = x - q * y    where  0 <= result < abs(y)
        q = divide(x, y.abs(), 0, 3, 1);
        q.s *= y.s;
      } else {
        q = divide(x, y, 0, Ctor.modulo, 1);
      }

      q = q.times(y);

      external = true;

      return x.minus(q);
    };


    /*
     * Return a new Decimal whose value is the natural exponential of the value of this Decimal,
     * i.e. the base e raised to the power the value of this Decimal, rounded to `precision`
     * significant digits using rounding mode `rounding`.
     *
     */
    P.naturalExponential = P.exp = function () {
      return naturalExponential(this);
    };


    /*
     * Return a new Decimal whose value is the natural logarithm of the value of this Decimal,
     * rounded to `precision` significant digits using rounding mode `rounding`.
     *
     */
    P.naturalLogarithm = P.ln = function () {
      return naturalLogarithm(this);
    };


    /*
     * Return a new Decimal whose value is the value of this Decimal negated, i.e. as if multiplied by
     * -1.
     *
     */
    P.negated = P.neg = function () {
      var x = new this.constructor(this);
      x.s = -x.s;
      return finalise(x);
    };


    /*
     *  n + 0 = n
     *  n + N = N
     *  n + I = I
     *  0 + n = n
     *  0 + 0 = 0
     *  0 + N = N
     *  0 + I = I
     *  N + n = N
     *  N + 0 = N
     *  N + N = N
     *  N + I = N
     *  I + n = I
     *  I + 0 = I
     *  I + N = N
     *  I + I = I
     *
     * Return a new Decimal whose value is the value of this Decimal plus `y`, rounded to `precision`
     * significant digits using rounding mode `rounding`.
     *
     */
    P.plus = P.add = function (y) {
      var carry, d, e, i, k, len, pr, rm, xd, yd,
        x = this,
        Ctor = x.constructor;

      y = new Ctor(y);

      // If either is not finite...
      if (!x.d || !y.d) {

        // Return NaN if either is NaN.
        if (!x.s || !y.s) y = new Ctor(NaN);

        // Return x if y is finite and x is ±Infinity.
        // Return x if both are ±Infinity with the same sign.
        // Return NaN if both are ±Infinity with different signs.
        // Return y if x is finite and y is ±Infinity.
        else if (!x.d) y = new Ctor(y.d || x.s === y.s ? x : NaN);

        return y;
      }

       // If signs differ...
      if (x.s != y.s) {
        y.s = -y.s;
        return x.minus(y);
      }

      xd = x.d;
      yd = y.d;
      pr = Ctor.precision;
      rm = Ctor.rounding;

      // If either is zero...
      if (!xd[0] || !yd[0]) {

        // Return x if y is zero.
        // Return y if y is non-zero.
        if (!yd[0]) y = new Ctor(x);

        return external ? finalise(y, pr, rm) : y;
      }

      // x and y are finite, non-zero numbers with the same sign.

      // Calculate base 1e7 exponents.
      k = mathfloor(x.e / LOG_BASE);
      e = mathfloor(y.e / LOG_BASE);

      xd = xd.slice();
      i = k - e;

      // If base 1e7 exponents differ...
      if (i) {

        if (i < 0) {
          d = xd;
          i = -i;
          len = yd.length;
        } else {
          d = yd;
          e = k;
          len = xd.length;
        }

        // Limit number of zeros prepended to max(ceil(pr / LOG_BASE), len) + 1.
        k = Math.ceil(pr / LOG_BASE);
        len = k > len ? k + 1 : len + 1;

        if (i > len) {
          i = len;
          d.length = 1;
        }

        // Prepend zeros to equalise exponents. Note: Faster to use reverse then do unshifts.
        d.reverse();
        for (; i--;) d.push(0);
        d.reverse();
      }

      len = xd.length;
      i = yd.length;

      // If yd is longer than xd, swap xd and yd so xd points to the longer array.
      if (len - i < 0) {
        i = len;
        d = yd;
        yd = xd;
        xd = d;
      }

      // Only start adding at yd.length - 1 as the further digits of xd can be left as they are.
      for (carry = 0; i;) {
        carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
        xd[i] %= BASE;
      }

      if (carry) {
        xd.unshift(carry);
        ++e;
      }

      // Remove trailing zeros.
      // No need to check for zero, as +x + +y != 0 && -x + -y != 0
      for (len = xd.length; xd[--len] == 0;) xd.pop();

      y.d = xd;
      y.e = getBase10Exponent(xd, e);

      return external ? finalise(y, pr, rm) : y;
    };


    /*
     * Return the number of significant digits of the value of this Decimal.
     *
     * [z] {boolean|number} Whether to count integer-part trailing zeros: true, false, 1 or 0.
     *
     */
    P.precision = P.sd = function (z) {
      var k,
        x = this;

      if (z !== void 0 && z !== !!z && z !== 1 && z !== 0) throw Error(invalidArgument + z);

      if (x.d) {
        k = getPrecision(x.d);
        if (z && x.e + 1 > k) k = x.e + 1;
      } else {
        k = NaN;
      }

      return k;
    };


    /*
     * Return a new Decimal whose value is the value of this Decimal rounded to a whole number using
     * rounding mode `rounding`.
     *
     */
    P.round = function () {
      var x = this,
        Ctor = x.constructor;

      return finalise(new Ctor(x), x.e + 1, Ctor.rounding);
    };


    /*
     * Return a new Decimal whose value is the sine of the value in radians of this Decimal.
     *
     * Domain: [-Infinity, Infinity]
     * Range: [-1, 1]
     *
     * sin(x) = x - x^3/3! + x^5/5! - ...
     *
     * sin(0)         = 0
     * sin(-0)        = -0
     * sin(Infinity)  = NaN
     * sin(-Infinity) = NaN
     * sin(NaN)       = NaN
     *
     */
    P.sine = P.sin = function () {
      var pr, rm,
        x = this,
        Ctor = x.constructor;

      if (!x.isFinite()) return new Ctor(NaN);
      if (x.isZero()) return new Ctor(x);

      pr = Ctor.precision;
      rm = Ctor.rounding;
      Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
      Ctor.rounding = 1;

      x = sine(Ctor, toLessThanHalfPi(Ctor, x));

      Ctor.precision = pr;
      Ctor.rounding = rm;

      return finalise(quadrant > 2 ? x.neg() : x, pr, rm, true);
    };


    /*
     * Return a new Decimal whose value is the square root of this Decimal, rounded to `precision`
     * significant digits using rounding mode `rounding`.
     *
     *  sqrt(-n) =  N
     *  sqrt(N)  =  N
     *  sqrt(-I) =  N
     *  sqrt(I)  =  I
     *  sqrt(0)  =  0
     *  sqrt(-0) = -0
     *
     */
    P.squareRoot = P.sqrt = function () {
      var m, n, sd, r, rep, t,
        x = this,
        d = x.d,
        e = x.e,
        s = x.s,
        Ctor = x.constructor;

      // Negative/NaN/Infinity/zero?
      if (s !== 1 || !d || !d[0]) {
        return new Ctor(!s || s < 0 && (!d || d[0]) ? NaN : d ? x : 1 / 0);
      }

      external = false;

      // Initial estimate.
      s = Math.sqrt(+x);

      // Math.sqrt underflow/overflow?
      // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
      if (s == 0 || s == 1 / 0) {
        n = digitsToString(d);

        if ((n.length + e) % 2 == 0) n += '0';
        s = Math.sqrt(n);
        e = mathfloor((e + 1) / 2) - (e < 0 || e % 2);

        if (s == 1 / 0) {
          n = '5e' + e;
        } else {
          n = s.toExponential();
          n = n.slice(0, n.indexOf('e') + 1) + e;
        }

        r = new Ctor(n);
      } else {
        r = new Ctor(s.toString());
      }

      sd = (e = Ctor.precision) + 3;

      // Newton-Raphson iteration.
      for (;;) {
        t = r;
        r = t.plus(divide(x, t, sd + 2, 1)).times(0.5);

        // TODO? Replace with for-loop and checkRoundingDigits.
        if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
          n = n.slice(sd - 3, sd + 1);

          // The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or
          // 4999, i.e. approaching a rounding boundary, continue the iteration.
          if (n == '9999' || !rep && n == '4999') {

            // On the first iteration only, check to see if rounding up gives the exact result as the
            // nines may infinitely repeat.
            if (!rep) {
              finalise(t, e + 1, 0);

              if (t.times(t).eq(x)) {
                r = t;
                break;
              }
            }

            sd += 4;
            rep = 1;
          } else {

            // If the rounding digits are null, 0{0,4} or 50{0,3}, check for an exact result.
            // If not, then there are further digits and m will be truthy.
            if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

              // Truncate to the first rounding digit.
              finalise(r, e + 1, 1);
              m = !r.times(r).eq(x);
            }

            break;
          }
        }
      }

      external = true;

      return finalise(r, e, Ctor.rounding, m);
    };


    /*
     * Return a new Decimal whose value is the tangent of the value in radians of this Decimal.
     *
     * Domain: [-Infinity, Infinity]
     * Range: [-Infinity, Infinity]
     *
     * tan(0)         = 0
     * tan(-0)        = -0
     * tan(Infinity)  = NaN
     * tan(-Infinity) = NaN
     * tan(NaN)       = NaN
     *
     */
    P.tangent = P.tan = function () {
      var pr, rm,
        x = this,
        Ctor = x.constructor;

      if (!x.isFinite()) return new Ctor(NaN);
      if (x.isZero()) return new Ctor(x);

      pr = Ctor.precision;
      rm = Ctor.rounding;
      Ctor.precision = pr + 10;
      Ctor.rounding = 1;

      x = x.sin();
      x.s = 1;
      x = divide(x, new Ctor(1).minus(x.times(x)).sqrt(), pr + 10, 0);

      Ctor.precision = pr;
      Ctor.rounding = rm;

      return finalise(quadrant == 2 || quadrant == 4 ? x.neg() : x, pr, rm, true);
    };


    /*
     *  n * 0 = 0
     *  n * N = N
     *  n * I = I
     *  0 * n = 0
     *  0 * 0 = 0
     *  0 * N = N
     *  0 * I = N
     *  N * n = N
     *  N * 0 = N
     *  N * N = N
     *  N * I = N
     *  I * n = I
     *  I * 0 = N
     *  I * N = N
     *  I * I = I
     *
     * Return a new Decimal whose value is this Decimal times `y`, rounded to `precision` significant
     * digits using rounding mode `rounding`.
     *
     */
    P.times = P.mul = function (y) {
      var carry, e, i, k, r, rL, t, xdL, ydL,
        x = this,
        Ctor = x.constructor,
        xd = x.d,
        yd = (y = new Ctor(y)).d;

      y.s *= x.s;

       // If either is NaN, ±Infinity or ±0...
      if (!xd || !xd[0] || !yd || !yd[0]) {

        return new Ctor(!y.s || xd && !xd[0] && !yd || yd && !yd[0] && !xd

          // Return NaN if either is NaN.
          // Return NaN if x is ±0 and y is ±Infinity, or y is ±0 and x is ±Infinity.
          ? NaN

          // Return ±Infinity if either is ±Infinity.
          // Return ±0 if either is ±0.
          : !xd || !yd ? y.s / 0 : y.s * 0);
      }

      e = mathfloor(x.e / LOG_BASE) + mathfloor(y.e / LOG_BASE);
      xdL = xd.length;
      ydL = yd.length;

      // Ensure xd points to the longer array.
      if (xdL < ydL) {
        r = xd;
        xd = yd;
        yd = r;
        rL = xdL;
        xdL = ydL;
        ydL = rL;
      }

      // Initialise the result array with zeros.
      r = [];
      rL = xdL + ydL;
      for (i = rL; i--;) r.push(0);

      // Multiply!
      for (i = ydL; --i >= 0;) {
        carry = 0;
        for (k = xdL + i; k > i;) {
          t = r[k] + yd[i] * xd[k - i - 1] + carry;
          r[k--] = t % BASE | 0;
          carry = t / BASE | 0;
        }

        r[k] = (r[k] + carry) % BASE | 0;
      }

      // Remove trailing zeros.
      for (; !r[--rL];) r.pop();

      if (carry) ++e;
      else r.shift();

      y.d = r;
      y.e = getBase10Exponent(r, e);

      return external ? finalise(y, Ctor.precision, Ctor.rounding) : y;
    };


    /*
     * Return a string representing the value of this Decimal in base 2, round to `sd` significant
     * digits using rounding mode `rm`.
     *
     * If the optional `sd` argument is present then return binary exponential notation.
     *
     * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    P.toBinary = function (sd, rm) {
      return toStringBinary(this, 2, sd, rm);
    };


    /*
     * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `dp`
     * decimal places using rounding mode `rm` or `rounding` if `rm` is omitted.
     *
     * If `dp` is omitted, return a new Decimal whose value is the value of this Decimal.
     *
     * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    P.toDecimalPlaces = P.toDP = function (dp, rm) {
      var x = this,
        Ctor = x.constructor;

      x = new Ctor(x);
      if (dp === void 0) return x;

      checkInt32(dp, 0, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);

      return finalise(x, dp + x.e + 1, rm);
    };


    /*
     * Return a string representing the value of this Decimal in exponential notation rounded to
     * `dp` fixed decimal places using rounding mode `rounding`.
     *
     * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    P.toExponential = function (dp, rm) {
      var str,
        x = this,
        Ctor = x.constructor;

      if (dp === void 0) {
        str = finiteToString(x, true);
      } else {
        checkInt32(dp, 0, MAX_DIGITS);

        if (rm === void 0) rm = Ctor.rounding;
        else checkInt32(rm, 0, 8);

        x = finalise(new Ctor(x), dp + 1, rm);
        str = finiteToString(x, true, dp + 1);
      }

      return x.isNeg() && !x.isZero() ? '-' + str : str;
    };


    /*
     * Return a string representing the value of this Decimal in normal (fixed-point) notation to
     * `dp` fixed decimal places and rounded using rounding mode `rm` or `rounding` if `rm` is
     * omitted.
     *
     * As with JavaScript numbers, (-0).toFixed(0) is '0', but e.g. (-0.00001).toFixed(0) is '-0'.
     *
     * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
     * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
     * (-0).toFixed(3) is '0.000'.
     * (-0.5).toFixed(0) is '-0'.
     *
     */
    P.toFixed = function (dp, rm) {
      var str, y,
        x = this,
        Ctor = x.constructor;

      if (dp === void 0) {
        str = finiteToString(x);
      } else {
        checkInt32(dp, 0, MAX_DIGITS);

        if (rm === void 0) rm = Ctor.rounding;
        else checkInt32(rm, 0, 8);

        y = finalise(new Ctor(x), dp + x.e + 1, rm);
        str = finiteToString(y, false, dp + y.e + 1);
      }

      // To determine whether to add the minus sign look at the value before it was rounded,
      // i.e. look at `x` rather than `y`.
      return x.isNeg() && !x.isZero() ? '-' + str : str;
    };


    /*
     * Return an array representing the value of this Decimal as a simple fraction with an integer
     * numerator and an integer denominator.
     *
     * The denominator will be a positive non-zero value less than or equal to the specified maximum
     * denominator. If a maximum denominator is not specified, the denominator will be the lowest
     * value necessary to represent the number exactly.
     *
     * [maxD] {number|string|Decimal} Maximum denominator. Integer >= 1 and < Infinity.
     *
     */
    P.toFraction = function (maxD) {
      var d, d0, d1, d2, e, k, n, n0, n1, pr, q, r,
        x = this,
        xd = x.d,
        Ctor = x.constructor;

      if (!xd) return new Ctor(x);

      n1 = d0 = new Ctor(1);
      d1 = n0 = new Ctor(0);

      d = new Ctor(d1);
      e = d.e = getPrecision(xd) - x.e - 1;
      k = e % LOG_BASE;
      d.d[0] = mathpow(10, k < 0 ? LOG_BASE + k : k);

      if (maxD == null) {

        // d is 10**e, the minimum max-denominator needed.
        maxD = e > 0 ? d : n1;
      } else {
        n = new Ctor(maxD);
        if (!n.isInt() || n.lt(n1)) throw Error(invalidArgument + n);
        maxD = n.gt(d) ? (e > 0 ? d : n1) : n;
      }

      external = false;
      n = new Ctor(digitsToString(xd));
      pr = Ctor.precision;
      Ctor.precision = e = xd.length * LOG_BASE * 2;

      for (;;)  {
        q = divide(n, d, 0, 1, 1);
        d2 = d0.plus(q.times(d1));
        if (d2.cmp(maxD) == 1) break;
        d0 = d1;
        d1 = d2;
        d2 = n1;
        n1 = n0.plus(q.times(d2));
        n0 = d2;
        d2 = d;
        d = n.minus(q.times(d2));
        n = d2;
      }

      d2 = divide(maxD.minus(d0), d1, 0, 1, 1);
      n0 = n0.plus(d2.times(n1));
      d0 = d0.plus(d2.times(d1));
      n0.s = n1.s = x.s;

      // Determine which fraction is closer to x, n0/d0 or n1/d1?
      r = divide(n1, d1, e, 1).minus(x).abs().cmp(divide(n0, d0, e, 1).minus(x).abs()) < 1
          ? [n1, d1] : [n0, d0];

      Ctor.precision = pr;
      external = true;

      return r;
    };


    /*
     * Return a string representing the value of this Decimal in base 16, round to `sd` significant
     * digits using rounding mode `rm`.
     *
     * If the optional `sd` argument is present then return binary exponential notation.
     *
     * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    P.toHexadecimal = P.toHex = function (sd, rm) {
      return toStringBinary(this, 16, sd, rm);
    };


    /*
     * Returns a new Decimal whose value is the nearest multiple of `y` in the direction of rounding
     * mode `rm`, or `Decimal.rounding` if `rm` is omitted, to the value of this Decimal.
     *
     * The return value will always have the same sign as this Decimal, unless either this Decimal
     * or `y` is NaN, in which case the return value will be also be NaN.
     *
     * The return value is not affected by the value of `precision`.
     *
     * y {number|string|Decimal} The magnitude to round to a multiple of.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * 'toNearest() rounding mode not an integer: {rm}'
     * 'toNearest() rounding mode out of range: {rm}'
     *
     */
    P.toNearest = function (y, rm) {
      var x = this,
        Ctor = x.constructor;

      x = new Ctor(x);

      if (y == null) {

        // If x is not finite, return x.
        if (!x.d) return x;

        y = new Ctor(1);
        rm = Ctor.rounding;
      } else {
        y = new Ctor(y);
        if (rm === void 0) {
          rm = Ctor.rounding;
        } else {
          checkInt32(rm, 0, 8);
        }

        // If x is not finite, return x if y is not NaN, else NaN.
        if (!x.d) return y.s ? x : y;

        // If y is not finite, return Infinity with the sign of x if y is Infinity, else NaN.
        if (!y.d) {
          if (y.s) y.s = x.s;
          return y;
        }
      }

      // If y is not zero, calculate the nearest multiple of y to x.
      if (y.d[0]) {
        external = false;
        x = divide(x, y, 0, rm, 1).times(y);
        external = true;
        finalise(x);

      // If y is zero, return zero with the sign of x.
      } else {
        y.s = x.s;
        x = y;
      }

      return x;
    };


    /*
     * Return the value of this Decimal converted to a number primitive.
     * Zero keeps its sign.
     *
     */
    P.toNumber = function () {
      return +this;
    };


    /*
     * Return a string representing the value of this Decimal in base 8, round to `sd` significant
     * digits using rounding mode `rm`.
     *
     * If the optional `sd` argument is present then return binary exponential notation.
     *
     * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    P.toOctal = function (sd, rm) {
      return toStringBinary(this, 8, sd, rm);
    };


    /*
     * Return a new Decimal whose value is the value of this Decimal raised to the power `y`, rounded
     * to `precision` significant digits using rounding mode `rounding`.
     *
     * ECMAScript compliant.
     *
     *   pow(x, NaN)                           = NaN
     *   pow(x, ±0)                            = 1

     *   pow(NaN, non-zero)                    = NaN
     *   pow(abs(x) > 1, +Infinity)            = +Infinity
     *   pow(abs(x) > 1, -Infinity)            = +0
     *   pow(abs(x) == 1, ±Infinity)           = NaN
     *   pow(abs(x) < 1, +Infinity)            = +0
     *   pow(abs(x) < 1, -Infinity)            = +Infinity
     *   pow(+Infinity, y > 0)                 = +Infinity
     *   pow(+Infinity, y < 0)                 = +0
     *   pow(-Infinity, odd integer > 0)       = -Infinity
     *   pow(-Infinity, even integer > 0)      = +Infinity
     *   pow(-Infinity, odd integer < 0)       = -0
     *   pow(-Infinity, even integer < 0)      = +0
     *   pow(+0, y > 0)                        = +0
     *   pow(+0, y < 0)                        = +Infinity
     *   pow(-0, odd integer > 0)              = -0
     *   pow(-0, even integer > 0)             = +0
     *   pow(-0, odd integer < 0)              = -Infinity
     *   pow(-0, even integer < 0)             = +Infinity
     *   pow(finite x < 0, finite non-integer) = NaN
     *
     * For non-integer or very large exponents pow(x, y) is calculated using
     *
     *   x^y = exp(y*ln(x))
     *
     * Assuming the first 15 rounding digits are each equally likely to be any digit 0-9, the
     * probability of an incorrectly rounded result
     * P([49]9{14} | [50]0{14}) = 2 * 0.2 * 10^-14 = 4e-15 = 1/2.5e+14
     * i.e. 1 in 250,000,000,000,000
     *
     * If a result is incorrectly rounded the maximum error will be 1 ulp (unit in last place).
     *
     * y {number|string|Decimal} The power to which to raise this Decimal.
     *
     */
    P.toPower = P.pow = function (y) {
      var e, k, pr, r, rm, s,
        x = this,
        Ctor = x.constructor,
        yn = +(y = new Ctor(y));

      // Either ±Infinity, NaN or ±0?
      if (!x.d || !y.d || !x.d[0] || !y.d[0]) return new Ctor(mathpow(+x, yn));

      x = new Ctor(x);

      if (x.eq(1)) return x;

      pr = Ctor.precision;
      rm = Ctor.rounding;

      if (y.eq(1)) return finalise(x, pr, rm);

      // y exponent
      e = mathfloor(y.e / LOG_BASE);

      // If y is a small integer use the 'exponentiation by squaring' algorithm.
      if (e >= y.d.length - 1 && (k = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
        r = intPow(Ctor, x, k, pr);
        return y.s < 0 ? new Ctor(1).div(r) : finalise(r, pr, rm);
      }

      s = x.s;

      // if x is negative
      if (s < 0) {

        // if y is not an integer
        if (e < y.d.length - 1) return new Ctor(NaN);

        // Result is positive if x is negative and the last digit of integer y is even.
        if ((y.d[e] & 1) == 0) s = 1;

        // if x.eq(-1)
        if (x.e == 0 && x.d[0] == 1 && x.d.length == 1) {
          x.s = s;
          return x;
        }
      }

      // Estimate result exponent.
      // x^y = 10^e,  where e = y * log10(x)
      // log10(x) = log10(x_significand) + x_exponent
      // log10(x_significand) = ln(x_significand) / ln(10)
      k = mathpow(+x, yn);
      e = k == 0 || !isFinite(k)
        ? mathfloor(yn * (Math.log('0.' + digitsToString(x.d)) / Math.LN10 + x.e + 1))
        : new Ctor(k + '').e;

      // Exponent estimate may be incorrect e.g. x: 0.999999999999999999, y: 2.29, e: 0, r.e: -1.

      // Overflow/underflow?
      if (e > Ctor.maxE + 1 || e < Ctor.minE - 1) return new Ctor(e > 0 ? s / 0 : 0);

      external = false;
      Ctor.rounding = x.s = 1;

      // Estimate the extra guard digits needed to ensure five correct rounding digits from
      // naturalLogarithm(x). Example of failure without these extra digits (precision: 10):
      // new Decimal(2.32456).pow('2087987436534566.46411')
      // should be 1.162377823e+764914905173815, but is 1.162355823e+764914905173815
      k = Math.min(12, (e + '').length);

      // r = x^y = exp(y*ln(x))
      r = naturalExponential(y.times(naturalLogarithm(x, pr + k)), pr);

      // r may be Infinity, e.g. (0.9999999999999999).pow(-1e+40)
      if (r.d) {

        // Truncate to the required precision plus five rounding digits.
        r = finalise(r, pr + 5, 1);

        // If the rounding digits are [49]9999 or [50]0000 increase the precision by 10 and recalculate
        // the result.
        if (checkRoundingDigits(r.d, pr, rm)) {
          e = pr + 10;

          // Truncate to the increased precision plus five rounding digits.
          r = finalise(naturalExponential(y.times(naturalLogarithm(x, e + k)), e), e + 5, 1);

          // Check for 14 nines from the 2nd rounding digit (the first rounding digit may be 4 or 9).
          if (+digitsToString(r.d).slice(pr + 1, pr + 15) + 1 == 1e14) {
            r = finalise(r, pr + 1, 0);
          }
        }
      }

      r.s = s;
      external = true;
      Ctor.rounding = rm;

      return finalise(r, pr, rm);
    };


    /*
     * Return a string representing the value of this Decimal rounded to `sd` significant digits
     * using rounding mode `rounding`.
     *
     * Return exponential notation if `sd` is less than the number of digits necessary to represent
     * the integer part of the value in normal notation.
     *
     * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     */
    P.toPrecision = function (sd, rm) {
      var str,
        x = this,
        Ctor = x.constructor;

      if (sd === void 0) {
        str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
      } else {
        checkInt32(sd, 1, MAX_DIGITS);

        if (rm === void 0) rm = Ctor.rounding;
        else checkInt32(rm, 0, 8);

        x = finalise(new Ctor(x), sd, rm);
        str = finiteToString(x, sd <= x.e || x.e <= Ctor.toExpNeg, sd);
      }

      return x.isNeg() && !x.isZero() ? '-' + str : str;
    };


    /*
     * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `sd`
     * significant digits using rounding mode `rm`, or to `precision` and `rounding` respectively if
     * omitted.
     *
     * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * 'toSD() digits out of range: {sd}'
     * 'toSD() digits not an integer: {sd}'
     * 'toSD() rounding mode not an integer: {rm}'
     * 'toSD() rounding mode out of range: {rm}'
     *
     */
    P.toSignificantDigits = P.toSD = function (sd, rm) {
      var x = this,
        Ctor = x.constructor;

      if (sd === void 0) {
        sd = Ctor.precision;
        rm = Ctor.rounding;
      } else {
        checkInt32(sd, 1, MAX_DIGITS);

        if (rm === void 0) rm = Ctor.rounding;
        else checkInt32(rm, 0, 8);
      }

      return finalise(new Ctor(x), sd, rm);
    };


    /*
     * Return a string representing the value of this Decimal.
     *
     * Return exponential notation if this Decimal has a positive exponent equal to or greater than
     * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
     *
     */
    P.toString = function () {
      var x = this,
        Ctor = x.constructor,
        str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);

      return x.isNeg() && !x.isZero() ? '-' + str : str;
    };


    /*
     * Return a new Decimal whose value is the value of this Decimal truncated to a whole number.
     *
     */
    P.truncated = P.trunc = function () {
      return finalise(new this.constructor(this), this.e + 1, 1);
    };


    /*
     * Return a string representing the value of this Decimal.
     * Unlike `toString`, negative zero will include the minus sign.
     *
     */
    P.valueOf = P.toJSON = function () {
      var x = this,
        Ctor = x.constructor,
        str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);

      return x.isNeg() ? '-' + str : str;
    };


    // Helper functions for Decimal.prototype (P) and/or Decimal methods, and their callers.


    /*
     *  digitsToString           P.cubeRoot, P.logarithm, P.squareRoot, P.toFraction, P.toPower,
     *                           finiteToString, naturalExponential, naturalLogarithm
     *  checkInt32               P.toDecimalPlaces, P.toExponential, P.toFixed, P.toNearest,
     *                           P.toPrecision, P.toSignificantDigits, toStringBinary, random
     *  checkRoundingDigits      P.logarithm, P.toPower, naturalExponential, naturalLogarithm
     *  convertBase              toStringBinary, parseOther
     *  cos                      P.cos
     *  divide                   P.atanh, P.cubeRoot, P.dividedBy, P.dividedToIntegerBy,
     *                           P.logarithm, P.modulo, P.squareRoot, P.tan, P.tanh, P.toFraction,
     *                           P.toNearest, toStringBinary, naturalExponential, naturalLogarithm,
     *                           taylorSeries, atan2, parseOther
     *  finalise                 P.absoluteValue, P.atan, P.atanh, P.ceil, P.cos, P.cosh,
     *                           P.cubeRoot, P.dividedToIntegerBy, P.floor, P.logarithm, P.minus,
     *                           P.modulo, P.negated, P.plus, P.round, P.sin, P.sinh, P.squareRoot,
     *                           P.tan, P.times, P.toDecimalPlaces, P.toExponential, P.toFixed,
     *                           P.toNearest, P.toPower, P.toPrecision, P.toSignificantDigits,
     *                           P.truncated, divide, getLn10, getPi, naturalExponential,
     *                           naturalLogarithm, ceil, floor, round, trunc
     *  finiteToString           P.toExponential, P.toFixed, P.toPrecision, P.toString, P.valueOf,
     *                           toStringBinary
     *  getBase10Exponent        P.minus, P.plus, P.times, parseOther
     *  getLn10                  P.logarithm, naturalLogarithm
     *  getPi                    P.acos, P.asin, P.atan, toLessThanHalfPi, atan2
     *  getPrecision             P.precision, P.toFraction
     *  getZeroString            digitsToString, finiteToString
     *  intPow                   P.toPower, parseOther
     *  isOdd                    toLessThanHalfPi
     *  maxOrMin                 max, min
     *  naturalExponential       P.naturalExponential, P.toPower
     *  naturalLogarithm         P.acosh, P.asinh, P.atanh, P.logarithm, P.naturalLogarithm,
     *                           P.toPower, naturalExponential
     *  nonFiniteToString        finiteToString, toStringBinary
     *  parseDecimal             Decimal
     *  parseOther               Decimal
     *  sin                      P.sin
     *  taylorSeries             P.cosh, P.sinh, cos, sin
     *  toLessThanHalfPi         P.cos, P.sin
     *  toStringBinary           P.toBinary, P.toHexadecimal, P.toOctal
     *  truncate                 intPow
     *
     *  Throws:                  P.logarithm, P.precision, P.toFraction, checkInt32, getLn10, getPi,
     *                           naturalLogarithm, config, parseOther, random, Decimal
     */


    function digitsToString(d) {
      var i, k, ws,
        indexOfLastWord = d.length - 1,
        str = '',
        w = d[0];

      if (indexOfLastWord > 0) {
        str += w;
        for (i = 1; i < indexOfLastWord; i++) {
          ws = d[i] + '';
          k = LOG_BASE - ws.length;
          if (k) str += getZeroString(k);
          str += ws;
        }

        w = d[i];
        ws = w + '';
        k = LOG_BASE - ws.length;
        if (k) str += getZeroString(k);
      } else if (w === 0) {
        return '0';
      }

      // Remove trailing zeros of last w.
      for (; w % 10 === 0;) w /= 10;

      return str + w;
    }


    function checkInt32(i, min, max) {
      if (i !== ~~i || i < min || i > max) {
        throw Error(invalidArgument + i);
      }
    }


    /*
     * Check 5 rounding digits if `repeating` is null, 4 otherwise.
     * `repeating == null` if caller is `log` or `pow`,
     * `repeating != null` if caller is `naturalLogarithm` or `naturalExponential`.
     */
    function checkRoundingDigits(d, i, rm, repeating) {
      var di, k, r, rd;

      // Get the length of the first word of the array d.
      for (k = d[0]; k >= 10; k /= 10) --i;

      // Is the rounding digit in the first word of d?
      if (--i < 0) {
        i += LOG_BASE;
        di = 0;
      } else {
        di = Math.ceil((i + 1) / LOG_BASE);
        i %= LOG_BASE;
      }

      // i is the index (0 - 6) of the rounding digit.
      // E.g. if within the word 3487563 the first rounding digit is 5,
      // then i = 4, k = 1000, rd = 3487563 % 1000 = 563
      k = mathpow(10, LOG_BASE - i);
      rd = d[di] % k | 0;

      if (repeating == null) {
        if (i < 3) {
          if (i == 0) rd = rd / 100 | 0;
          else if (i == 1) rd = rd / 10 | 0;
          r = rm < 4 && rd == 99999 || rm > 3 && rd == 49999 || rd == 50000 || rd == 0;
        } else {
          r = (rm < 4 && rd + 1 == k || rm > 3 && rd + 1 == k / 2) &&
            (d[di + 1] / k / 100 | 0) == mathpow(10, i - 2) - 1 ||
              (rd == k / 2 || rd == 0) && (d[di + 1] / k / 100 | 0) == 0;
        }
      } else {
        if (i < 4) {
          if (i == 0) rd = rd / 1000 | 0;
          else if (i == 1) rd = rd / 100 | 0;
          else if (i == 2) rd = rd / 10 | 0;
          r = (repeating || rm < 4) && rd == 9999 || !repeating && rm > 3 && rd == 4999;
        } else {
          r = ((repeating || rm < 4) && rd + 1 == k ||
          (!repeating && rm > 3) && rd + 1 == k / 2) &&
            (d[di + 1] / k / 1000 | 0) == mathpow(10, i - 3) - 1;
        }
      }

      return r;
    }


    // Convert string of `baseIn` to an array of numbers of `baseOut`.
    // Eg. convertBase('255', 10, 16) returns [15, 15].
    // Eg. convertBase('ff', 16, 10) returns [2, 5, 5].
    function convertBase(str, baseIn, baseOut) {
      var j,
        arr = [0],
        arrL,
        i = 0,
        strL = str.length;

      for (; i < strL;) {
        for (arrL = arr.length; arrL--;) arr[arrL] *= baseIn;
        arr[0] += NUMERALS.indexOf(str.charAt(i++));
        for (j = 0; j < arr.length; j++) {
          if (arr[j] > baseOut - 1) {
            if (arr[j + 1] === void 0) arr[j + 1] = 0;
            arr[j + 1] += arr[j] / baseOut | 0;
            arr[j] %= baseOut;
          }
        }
      }

      return arr.reverse();
    }


    /*
     * cos(x) = 1 - x^2/2! + x^4/4! - ...
     * |x| < pi/2
     *
     */
    function cosine(Ctor, x) {
      var k, len, y;

      if (x.isZero()) return x;

      // Argument reduction: cos(4x) = 8*(cos^4(x) - cos^2(x)) + 1
      // i.e. cos(x) = 8*(cos^4(x/4) - cos^2(x/4)) + 1

      // Estimate the optimum number of times to use the argument reduction.
      len = x.d.length;
      if (len < 32) {
        k = Math.ceil(len / 3);
        y = (1 / tinyPow(4, k)).toString();
      } else {
        k = 16;
        y = '2.3283064365386962890625e-10';
      }

      Ctor.precision += k;

      x = taylorSeries(Ctor, 1, x.times(y), new Ctor(1));

      // Reverse argument reduction
      for (var i = k; i--;) {
        var cos2x = x.times(x);
        x = cos2x.times(cos2x).minus(cos2x).times(8).plus(1);
      }

      Ctor.precision -= k;

      return x;
    }


    /*
     * Perform division in the specified base.
     */
    var divide = (function () {

      // Assumes non-zero x and k, and hence non-zero result.
      function multiplyInteger(x, k, base) {
        var temp,
          carry = 0,
          i = x.length;

        for (x = x.slice(); i--;) {
          temp = x[i] * k + carry;
          x[i] = temp % base | 0;
          carry = temp / base | 0;
        }

        if (carry) x.unshift(carry);

        return x;
      }

      function compare(a, b, aL, bL) {
        var i, r;

        if (aL != bL) {
          r = aL > bL ? 1 : -1;
        } else {
          for (i = r = 0; i < aL; i++) {
            if (a[i] != b[i]) {
              r = a[i] > b[i] ? 1 : -1;
              break;
            }
          }
        }

        return r;
      }

      function subtract(a, b, aL, base) {
        var i = 0;

        // Subtract b from a.
        for (; aL--;) {
          a[aL] -= i;
          i = a[aL] < b[aL] ? 1 : 0;
          a[aL] = i * base + a[aL] - b[aL];
        }

        // Remove leading zeros.
        for (; !a[0] && a.length > 1;) a.shift();
      }

      return function (x, y, pr, rm, dp, base) {
        var cmp, e, i, k, logBase, more, prod, prodL, q, qd, rem, remL, rem0, sd, t, xi, xL, yd0,
          yL, yz,
          Ctor = x.constructor,
          sign = x.s == y.s ? 1 : -1,
          xd = x.d,
          yd = y.d;

        // Either NaN, Infinity or 0?
        if (!xd || !xd[0] || !yd || !yd[0]) {

          return new Ctor(// Return NaN if either NaN, or both Infinity or 0.
            !x.s || !y.s || (xd ? yd && xd[0] == yd[0] : !yd) ? NaN :

            // Return ±0 if x is 0 or y is ±Infinity, or return ±Infinity as y is 0.
            xd && xd[0] == 0 || !yd ? sign * 0 : sign / 0);
        }

        if (base) {
          logBase = 1;
          e = x.e - y.e;
        } else {
          base = BASE;
          logBase = LOG_BASE;
          e = mathfloor(x.e / logBase) - mathfloor(y.e / logBase);
        }

        yL = yd.length;
        xL = xd.length;
        q = new Ctor(sign);
        qd = q.d = [];

        // Result exponent may be one less than e.
        // The digit array of a Decimal from toStringBinary may have trailing zeros.
        for (i = 0; yd[i] == (xd[i] || 0); i++);

        if (yd[i] > (xd[i] || 0)) e--;

        if (pr == null) {
          sd = pr = Ctor.precision;
          rm = Ctor.rounding;
        } else if (dp) {
          sd = pr + (x.e - y.e) + 1;
        } else {
          sd = pr;
        }

        if (sd < 0) {
          qd.push(1);
          more = true;
        } else {

          // Convert precision in number of base 10 digits to base 1e7 digits.
          sd = sd / logBase + 2 | 0;
          i = 0;

          // divisor < 1e7
          if (yL == 1) {
            k = 0;
            yd = yd[0];
            sd++;

            // k is the carry.
            for (; (i < xL || k) && sd--; i++) {
              t = k * base + (xd[i] || 0);
              qd[i] = t / yd | 0;
              k = t % yd | 0;
            }

            more = k || i < xL;

          // divisor >= 1e7
          } else {

            // Normalise xd and yd so highest order digit of yd is >= base/2
            k = base / (yd[0] + 1) | 0;

            if (k > 1) {
              yd = multiplyInteger(yd, k, base);
              xd = multiplyInteger(xd, k, base);
              yL = yd.length;
              xL = xd.length;
            }

            xi = yL;
            rem = xd.slice(0, yL);
            remL = rem.length;

            // Add zeros to make remainder as long as divisor.
            for (; remL < yL;) rem[remL++] = 0;

            yz = yd.slice();
            yz.unshift(0);
            yd0 = yd[0];

            if (yd[1] >= base / 2) ++yd0;

            do {
              k = 0;

              // Compare divisor and remainder.
              cmp = compare(yd, rem, yL, remL);

              // If divisor < remainder.
              if (cmp < 0) {

                // Calculate trial digit, k.
                rem0 = rem[0];
                if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);

                // k will be how many times the divisor goes into the current remainder.
                k = rem0 / yd0 | 0;

                //  Algorithm:
                //  1. product = divisor * trial digit (k)
                //  2. if product > remainder: product -= divisor, k--
                //  3. remainder -= product
                //  4. if product was < remainder at 2:
                //    5. compare new remainder and divisor
                //    6. If remainder > divisor: remainder -= divisor, k++

                if (k > 1) {
                  if (k >= base) k = base - 1;

                  // product = divisor * trial digit.
                  prod = multiplyInteger(yd, k, base);
                  prodL = prod.length;
                  remL = rem.length;

                  // Compare product and remainder.
                  cmp = compare(prod, rem, prodL, remL);

                  // product > remainder.
                  if (cmp == 1) {
                    k--;

                    // Subtract divisor from product.
                    subtract(prod, yL < prodL ? yz : yd, prodL, base);
                  }
                } else {

                  // cmp is -1.
                  // If k is 0, there is no need to compare yd and rem again below, so change cmp to 1
                  // to avoid it. If k is 1 there is a need to compare yd and rem again below.
                  if (k == 0) cmp = k = 1;
                  prod = yd.slice();
                }

                prodL = prod.length;
                if (prodL < remL) prod.unshift(0);

                // Subtract product from remainder.
                subtract(rem, prod, remL, base);

                // If product was < previous remainder.
                if (cmp == -1) {
                  remL = rem.length;

                  // Compare divisor and new remainder.
                  cmp = compare(yd, rem, yL, remL);

                  // If divisor < new remainder, subtract divisor from remainder.
                  if (cmp < 1) {
                    k++;

                    // Subtract divisor from remainder.
                    subtract(rem, yL < remL ? yz : yd, remL, base);
                  }
                }

                remL = rem.length;
              } else if (cmp === 0) {
                k++;
                rem = [0];
              }    // if cmp === 1, k will be 0

              // Add the next digit, k, to the result array.
              qd[i++] = k;

              // Update the remainder.
              if (cmp && rem[0]) {
                rem[remL++] = xd[xi] || 0;
              } else {
                rem = [xd[xi]];
                remL = 1;
              }

            } while ((xi++ < xL || rem[0] !== void 0) && sd--);

            more = rem[0] !== void 0;
          }

          // Leading zero?
          if (!qd[0]) qd.shift();
        }

        // logBase is 1 when divide is being used for base conversion.
        if (logBase == 1) {
          q.e = e;
          inexact = more;
        } else {

          // To calculate q.e, first get the number of digits of qd[0].
          for (i = 1, k = qd[0]; k >= 10; k /= 10) i++;
          q.e = i + e * logBase - 1;

          finalise(q, dp ? pr + q.e + 1 : pr, rm, more);
        }

        return q;
      };
    })();


    /*
     * Round `x` to `sd` significant digits using rounding mode `rm`.
     * Check for over/under-flow.
     */
     function finalise(x, sd, rm, isTruncated) {
      var digits, i, j, k, rd, roundUp, w, xd, xdi,
        Ctor = x.constructor;

      // Don't round if sd is null or undefined.
      out: if (sd != null) {
        xd = x.d;

        // Infinity/NaN.
        if (!xd) return x;

        // rd: the rounding digit, i.e. the digit after the digit that may be rounded up.
        // w: the word of xd containing rd, a base 1e7 number.
        // xdi: the index of w within xd.
        // digits: the number of digits of w.
        // i: what would be the index of rd within w if all the numbers were 7 digits long (i.e. if
        // they had leading zeros)
        // j: if > 0, the actual index of rd within w (if < 0, rd is a leading zero).

        // Get the length of the first word of the digits array xd.
        for (digits = 1, k = xd[0]; k >= 10; k /= 10) digits++;
        i = sd - digits;

        // Is the rounding digit in the first word of xd?
        if (i < 0) {
          i += LOG_BASE;
          j = sd;
          w = xd[xdi = 0];

          // Get the rounding digit at index j of w.
          rd = w / mathpow(10, digits - j - 1) % 10 | 0;
        } else {
          xdi = Math.ceil((i + 1) / LOG_BASE);
          k = xd.length;
          if (xdi >= k) {
            if (isTruncated) {

              // Needed by `naturalExponential`, `naturalLogarithm` and `squareRoot`.
              for (; k++ <= xdi;) xd.push(0);
              w = rd = 0;
              digits = 1;
              i %= LOG_BASE;
              j = i - LOG_BASE + 1;
            } else {
              break out;
            }
          } else {
            w = k = xd[xdi];

            // Get the number of digits of w.
            for (digits = 1; k >= 10; k /= 10) digits++;

            // Get the index of rd within w.
            i %= LOG_BASE;

            // Get the index of rd within w, adjusted for leading zeros.
            // The number of leading zeros of w is given by LOG_BASE - digits.
            j = i - LOG_BASE + digits;

            // Get the rounding digit at index j of w.
            rd = j < 0 ? 0 : w / mathpow(10, digits - j - 1) % 10 | 0;
          }
        }

        // Are there any non-zero digits after the rounding digit?
        isTruncated = isTruncated || sd < 0 ||
          xd[xdi + 1] !== void 0 || (j < 0 ? w : w % mathpow(10, digits - j - 1));

        // The expression `w % mathpow(10, digits - j - 1)` returns all the digits of w to the right
        // of the digit at (left-to-right) index j, e.g. if w is 908714 and j is 2, the expression
        // will give 714.

        roundUp = rm < 4
          ? (rd || isTruncated) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
          : rd > 5 || rd == 5 && (rm == 4 || isTruncated || rm == 6 &&

            // Check whether the digit to the left of the rounding digit is odd.
            ((i > 0 ? j > 0 ? w / mathpow(10, digits - j) : 0 : xd[xdi - 1]) % 10) & 1 ||
              rm == (x.s < 0 ? 8 : 7));

        if (sd < 1 || !xd[0]) {
          xd.length = 0;
          if (roundUp) {

            // Convert sd to decimal places.
            sd -= x.e + 1;

            // 1, 0.1, 0.01, 0.001, 0.0001 etc.
            xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
            x.e = -sd || 0;
          } else {

            // Zero.
            xd[0] = x.e = 0;
          }

          return x;
        }

        // Remove excess digits.
        if (i == 0) {
          xd.length = xdi;
          k = 1;
          xdi--;
        } else {
          xd.length = xdi + 1;
          k = mathpow(10, LOG_BASE - i);

          // E.g. 56700 becomes 56000 if 7 is the rounding digit.
          // j > 0 means i > number of leading zeros of w.
          xd[xdi] = j > 0 ? (w / mathpow(10, digits - j) % mathpow(10, j) | 0) * k : 0;
        }

        if (roundUp) {
          for (;;) {

            // Is the digit to be rounded up in the first word of xd?
            if (xdi == 0) {

              // i will be the length of xd[0] before k is added.
              for (i = 1, j = xd[0]; j >= 10; j /= 10) i++;
              j = xd[0] += k;
              for (k = 1; j >= 10; j /= 10) k++;

              // if i != k the length has increased.
              if (i != k) {
                x.e++;
                if (xd[0] == BASE) xd[0] = 1;
              }

              break;
            } else {
              xd[xdi] += k;
              if (xd[xdi] != BASE) break;
              xd[xdi--] = 0;
              k = 1;
            }
          }
        }

        // Remove trailing zeros.
        for (i = xd.length; xd[--i] === 0;) xd.pop();
      }

      if (external) {

        // Overflow?
        if (x.e > Ctor.maxE) {

          // Infinity.
          x.d = null;
          x.e = NaN;

        // Underflow?
        } else if (x.e < Ctor.minE) {

          // Zero.
          x.e = 0;
          x.d = [0];
          // Ctor.underflow = true;
        } // else Ctor.underflow = false;
      }

      return x;
    }


    function finiteToString(x, isExp, sd) {
      if (!x.isFinite()) return nonFiniteToString(x);
      var k,
        e = x.e,
        str = digitsToString(x.d),
        len = str.length;

      if (isExp) {
        if (sd && (k = sd - len) > 0) {
          str = str.charAt(0) + '.' + str.slice(1) + getZeroString(k);
        } else if (len > 1) {
          str = str.charAt(0) + '.' + str.slice(1);
        }

        str = str + (x.e < 0 ? 'e' : 'e+') + x.e;
      } else if (e < 0) {
        str = '0.' + getZeroString(-e - 1) + str;
        if (sd && (k = sd - len) > 0) str += getZeroString(k);
      } else if (e >= len) {
        str += getZeroString(e + 1 - len);
        if (sd && (k = sd - e - 1) > 0) str = str + '.' + getZeroString(k);
      } else {
        if ((k = e + 1) < len) str = str.slice(0, k) + '.' + str.slice(k);
        if (sd && (k = sd - len) > 0) {
          if (e + 1 === len) str += '.';
          str += getZeroString(k);
        }
      }

      return str;
    }


    // Calculate the base 10 exponent from the base 1e7 exponent.
    function getBase10Exponent(digits, e) {
      var w = digits[0];

      // Add the number of digits of the first word of the digits array.
      for ( e *= LOG_BASE; w >= 10; w /= 10) e++;
      return e;
    }


    function getLn10(Ctor, sd, pr) {
      if (sd > LN10_PRECISION) {

        // Reset global state in case the exception is caught.
        external = true;
        if (pr) Ctor.precision = pr;
        throw Error(precisionLimitExceeded);
      }
      return finalise(new Ctor(LN10), sd, 1, true);
    }


    function getPi(Ctor, sd, rm) {
      if (sd > PI_PRECISION) throw Error(precisionLimitExceeded);
      return finalise(new Ctor(PI), sd, rm, true);
    }


    function getPrecision(digits) {
      var w = digits.length - 1,
        len = w * LOG_BASE + 1;

      w = digits[w];

      // If non-zero...
      if (w) {

        // Subtract the number of trailing zeros of the last word.
        for (; w % 10 == 0; w /= 10) len--;

        // Add the number of digits of the first word.
        for (w = digits[0]; w >= 10; w /= 10) len++;
      }

      return len;
    }


    function getZeroString(k) {
      var zs = '';
      for (; k--;) zs += '0';
      return zs;
    }


    /*
     * Return a new Decimal whose value is the value of Decimal `x` to the power `n`, where `n` is an
     * integer of type number.
     *
     * Implements 'exponentiation by squaring'. Called by `pow` and `parseOther`.
     *
     */
    function intPow(Ctor, x, n, pr) {
      var isTruncated,
        r = new Ctor(1),

        // Max n of 9007199254740991 takes 53 loop iterations.
        // Maximum digits array length; leaves [28, 34] guard digits.
        k = Math.ceil(pr / LOG_BASE + 4);

      external = false;

      for (;;) {
        if (n % 2) {
          r = r.times(x);
          if (truncate(r.d, k)) isTruncated = true;
        }

        n = mathfloor(n / 2);
        if (n === 0) {

          // To ensure correct rounding when r.d is truncated, increment the last word if it is zero.
          n = r.d.length - 1;
          if (isTruncated && r.d[n] === 0) ++r.d[n];
          break;
        }

        x = x.times(x);
        truncate(x.d, k);
      }

      external = true;

      return r;
    }


    function isOdd(n) {
      return n.d[n.d.length - 1] & 1;
    }


    /*
     * Handle `max` and `min`. `ltgt` is 'lt' or 'gt'.
     */
    function maxOrMin(Ctor, args, ltgt) {
      var y,
        x = new Ctor(args[0]),
        i = 0;

      for (; ++i < args.length;) {
        y = new Ctor(args[i]);
        if (!y.s) {
          x = y;
          break;
        } else if (x[ltgt](y)) {
          x = y;
        }
      }

      return x;
    }


    /*
     * Return a new Decimal whose value is the natural exponential of `x` rounded to `sd` significant
     * digits.
     *
     * Taylor/Maclaurin series.
     *
     * exp(x) = x^0/0! + x^1/1! + x^2/2! + x^3/3! + ...
     *
     * Argument reduction:
     *   Repeat x = x / 32, k += 5, until |x| < 0.1
     *   exp(x) = exp(x / 2^k)^(2^k)
     *
     * Previously, the argument was initially reduced by
     * exp(x) = exp(r) * 10^k  where r = x - k * ln10, k = floor(x / ln10)
     * to first put r in the range [0, ln10], before dividing by 32 until |x| < 0.1, but this was
     * found to be slower than just dividing repeatedly by 32 as above.
     *
     * Max integer argument: exp('20723265836946413') = 6.3e+9000000000000000
     * Min integer argument: exp('-20723265836946411') = 1.2e-9000000000000000
     * (Math object integer min/max: Math.exp(709) = 8.2e+307, Math.exp(-745) = 5e-324)
     *
     *  exp(Infinity)  = Infinity
     *  exp(-Infinity) = 0
     *  exp(NaN)       = NaN
     *  exp(±0)        = 1
     *
     *  exp(x) is non-terminating for any finite, non-zero x.
     *
     *  The result will always be correctly rounded.
     *
     */
    function naturalExponential(x, sd) {
      var denominator, guard, j, pow, sum, t, wpr,
        rep = 0,
        i = 0,
        k = 0,
        Ctor = x.constructor,
        rm = Ctor.rounding,
        pr = Ctor.precision;

      // 0/NaN/Infinity?
      if (!x.d || !x.d[0] || x.e > 17) {

        return new Ctor(x.d
          ? !x.d[0] ? 1 : x.s < 0 ? 0 : 1 / 0
          : x.s ? x.s < 0 ? 0 : x : 0 / 0);
      }

      if (sd == null) {
        external = false;
        wpr = pr;
      } else {
        wpr = sd;
      }

      t = new Ctor(0.03125);

      // while abs(x) >= 0.1
      while (x.e > -2) {

        // x = x / 2^5
        x = x.times(t);
        k += 5;
      }

      // Use 2 * log10(2^k) + 5 (empirically derived) to estimate the increase in precision
      // necessary to ensure the first 4 rounding digits are correct.
      guard = Math.log(mathpow(2, k)) / Math.LN10 * 2 + 5 | 0;
      wpr += guard;
      denominator = pow = sum = new Ctor(1);
      Ctor.precision = wpr;

      for (;;) {
        pow = finalise(pow.times(x), wpr, 1);
        denominator = denominator.times(++i);
        t = sum.plus(divide(pow, denominator, wpr, 1));

        if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
          j = k;
          while (j--) sum = finalise(sum.times(sum), wpr, 1);

          // Check to see if the first 4 rounding digits are [49]999.
          // If so, repeat the summation with a higher precision, otherwise
          // e.g. with precision: 18, rounding: 1
          // exp(18.404272462595034083567793919843761) = 98372560.1229999999 (should be 98372560.123)
          // `wpr - guard` is the index of first rounding digit.
          if (sd == null) {

            if (rep < 3 && checkRoundingDigits(sum.d, wpr - guard, rm, rep)) {
              Ctor.precision = wpr += 10;
              denominator = pow = t = new Ctor(1);
              i = 0;
              rep++;
            } else {
              return finalise(sum, Ctor.precision = pr, rm, external = true);
            }
          } else {
            Ctor.precision = pr;
            return sum;
          }
        }

        sum = t;
      }
    }


    /*
     * Return a new Decimal whose value is the natural logarithm of `x` rounded to `sd` significant
     * digits.
     *
     *  ln(-n)        = NaN
     *  ln(0)         = -Infinity
     *  ln(-0)        = -Infinity
     *  ln(1)         = 0
     *  ln(Infinity)  = Infinity
     *  ln(-Infinity) = NaN
     *  ln(NaN)       = NaN
     *
     *  ln(n) (n != 1) is non-terminating.
     *
     */
    function naturalLogarithm(y, sd) {
      var c, c0, denominator, e, numerator, rep, sum, t, wpr, x1, x2,
        n = 1,
        guard = 10,
        x = y,
        xd = x.d,
        Ctor = x.constructor,
        rm = Ctor.rounding,
        pr = Ctor.precision;

      // Is x negative or Infinity, NaN, 0 or 1?
      if (x.s < 0 || !xd || !xd[0] || !x.e && xd[0] == 1 && xd.length == 1) {
        return new Ctor(xd && !xd[0] ? -1 / 0 : x.s != 1 ? NaN : xd ? 0 : x);
      }

      if (sd == null) {
        external = false;
        wpr = pr;
      } else {
        wpr = sd;
      }

      Ctor.precision = wpr += guard;
      c = digitsToString(xd);
      c0 = c.charAt(0);

      if (Math.abs(e = x.e) < 1.5e15) {

        // Argument reduction.
        // The series converges faster the closer the argument is to 1, so using
        // ln(a^b) = b * ln(a),   ln(a) = ln(a^b) / b
        // multiply the argument by itself until the leading digits of the significand are 7, 8, 9,
        // 10, 11, 12 or 13, recording the number of multiplications so the sum of the series can
        // later be divided by this number, then separate out the power of 10 using
        // ln(a*10^b) = ln(a) + b*ln(10).

        // max n is 21 (gives 0.9, 1.0 or 1.1) (9e15 / 21 = 4.2e14).
        //while (c0 < 9 && c0 != 1 || c0 == 1 && c.charAt(1) > 1) {
        // max n is 6 (gives 0.7 - 1.3)
        while (c0 < 7 && c0 != 1 || c0 == 1 && c.charAt(1) > 3) {
          x = x.times(y);
          c = digitsToString(x.d);
          c0 = c.charAt(0);
          n++;
        }

        e = x.e;

        if (c0 > 1) {
          x = new Ctor('0.' + c);
          e++;
        } else {
          x = new Ctor(c0 + '.' + c.slice(1));
        }
      } else {

        // The argument reduction method above may result in overflow if the argument y is a massive
        // number with exponent >= 1500000000000000 (9e15 / 6 = 1.5e15), so instead recall this
        // function using ln(x*10^e) = ln(x) + e*ln(10).
        t = getLn10(Ctor, wpr + 2, pr).times(e + '');
        x = naturalLogarithm(new Ctor(c0 + '.' + c.slice(1)), wpr - guard).plus(t);
        Ctor.precision = pr;

        return sd == null ? finalise(x, pr, rm, external = true) : x;
      }

      // x1 is x reduced to a value near 1.
      x1 = x;

      // Taylor series.
      // ln(y) = ln((1 + x)/(1 - x)) = 2(x + x^3/3 + x^5/5 + x^7/7 + ...)
      // where x = (y - 1)/(y + 1)    (|x| < 1)
      sum = numerator = x = divide(x.minus(1), x.plus(1), wpr, 1);
      x2 = finalise(x.times(x), wpr, 1);
      denominator = 3;

      for (;;) {
        numerator = finalise(numerator.times(x2), wpr, 1);
        t = sum.plus(divide(numerator, new Ctor(denominator), wpr, 1));

        if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
          sum = sum.times(2);

          // Reverse the argument reduction. Check that e is not 0 because, besides preventing an
          // unnecessary calculation, -0 + 0 = +0 and to ensure correct rounding -0 needs to stay -0.
          if (e !== 0) sum = sum.plus(getLn10(Ctor, wpr + 2, pr).times(e + ''));
          sum = divide(sum, new Ctor(n), wpr, 1);

          // Is rm > 3 and the first 4 rounding digits 4999, or rm < 4 (or the summation has
          // been repeated previously) and the first 4 rounding digits 9999?
          // If so, restart the summation with a higher precision, otherwise
          // e.g. with precision: 12, rounding: 1
          // ln(135520028.6126091714265381533) = 18.7246299999 when it should be 18.72463.
          // `wpr - guard` is the index of first rounding digit.
          if (sd == null) {
            if (checkRoundingDigits(sum.d, wpr - guard, rm, rep)) {
              Ctor.precision = wpr += guard;
              t = numerator = x = divide(x1.minus(1), x1.plus(1), wpr, 1);
              x2 = finalise(x.times(x), wpr, 1);
              denominator = rep = 1;
            } else {
              return finalise(sum, Ctor.precision = pr, rm, external = true);
            }
          } else {
            Ctor.precision = pr;
            return sum;
          }
        }

        sum = t;
        denominator += 2;
      }
    }


    // ±Infinity, NaN.
    function nonFiniteToString(x) {
      // Unsigned.
      return String(x.s * x.s / 0);
    }


    /*
     * Parse the value of a new Decimal `x` from string `str`.
     */
    function parseDecimal(x, str) {
      var e, i, len;

      // Decimal point?
      if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');

      // Exponential form?
      if ((i = str.search(/e/i)) > 0) {

        // Determine exponent.
        if (e < 0) e = i;
        e += +str.slice(i + 1);
        str = str.substring(0, i);
      } else if (e < 0) {

        // Integer.
        e = str.length;
      }

      // Determine leading zeros.
      for (i = 0; str.charCodeAt(i) === 48; i++);

      // Determine trailing zeros.
      for (len = str.length; str.charCodeAt(len - 1) === 48; --len);
      str = str.slice(i, len);

      if (str) {
        len -= i;
        x.e = e = e - i - 1;
        x.d = [];

        // Transform base

        // e is the base 10 exponent.
        // i is where to slice str to get the first word of the digits array.
        i = (e + 1) % LOG_BASE;
        if (e < 0) i += LOG_BASE;

        if (i < len) {
          if (i) x.d.push(+str.slice(0, i));
          for (len -= LOG_BASE; i < len;) x.d.push(+str.slice(i, i += LOG_BASE));
          str = str.slice(i);
          i = LOG_BASE - str.length;
        } else {
          i -= len;
        }

        for (; i--;) str += '0';
        x.d.push(+str);

        if (external) {

          // Overflow?
          if (x.e > x.constructor.maxE) {

            // Infinity.
            x.d = null;
            x.e = NaN;

          // Underflow?
          } else if (x.e < x.constructor.minE) {

            // Zero.
            x.e = 0;
            x.d = [0];
            // x.constructor.underflow = true;
          } // else x.constructor.underflow = false;
        }
      } else {

        // Zero.
        x.e = 0;
        x.d = [0];
      }

      return x;
    }


    /*
     * Parse the value of a new Decimal `x` from a string `str`, which is not a decimal value.
     */
    function parseOther(x, str) {
      var base, Ctor, divisor, i, isFloat, len, p, xd, xe;

      if (str.indexOf('_') > -1) {
        str = str.replace(/(\d)_(?=\d)/g, '$1');
        if (isDecimal.test(str)) return parseDecimal(x, str);
      } else if (str === 'Infinity' || str === 'NaN') {
        if (!+str) x.s = NaN;
        x.e = NaN;
        x.d = null;
        return x;
      }

      if (isHex.test(str))  {
        base = 16;
        str = str.toLowerCase();
      } else if (isBinary.test(str))  {
        base = 2;
      } else if (isOctal.test(str))  {
        base = 8;
      } else {
        throw Error(invalidArgument + str);
      }

      // Is there a binary exponent part?
      i = str.search(/p/i);

      if (i > 0) {
        p = +str.slice(i + 1);
        str = str.substring(2, i);
      } else {
        str = str.slice(2);
      }

      // Convert `str` as an integer then divide the result by `base` raised to a power such that the
      // fraction part will be restored.
      i = str.indexOf('.');
      isFloat = i >= 0;
      Ctor = x.constructor;

      if (isFloat) {
        str = str.replace('.', '');
        len = str.length;
        i = len - i;

        // log[10](16) = 1.2041... , log[10](88) = 1.9444....
        divisor = intPow(Ctor, new Ctor(base), i, i * 2);
      }

      xd = convertBase(str, base, BASE);
      xe = xd.length - 1;

      // Remove trailing zeros.
      for (i = xe; xd[i] === 0; --i) xd.pop();
      if (i < 0) return new Ctor(x.s * 0);
      x.e = getBase10Exponent(xd, xe);
      x.d = xd;
      external = false;

      // At what precision to perform the division to ensure exact conversion?
      // maxDecimalIntegerPartDigitCount = ceil(log[10](b) * otherBaseIntegerPartDigitCount)
      // log[10](2) = 0.30103, log[10](8) = 0.90309, log[10](16) = 1.20412
      // E.g. ceil(1.2 * 3) = 4, so up to 4 decimal digits are needed to represent 3 hex int digits.
      // maxDecimalFractionPartDigitCount = {Hex:4|Oct:3|Bin:1} * otherBaseFractionPartDigitCount
      // Therefore using 4 * the number of digits of str will always be enough.
      if (isFloat) x = divide(x, divisor, len * 4);

      // Multiply by the binary exponent part if present.
      if (p) x = x.times(Math.abs(p) < 54 ? mathpow(2, p) : Decimal.pow(2, p));
      external = true;

      return x;
    }


    /*
     * sin(x) = x - x^3/3! + x^5/5! - ...
     * |x| < pi/2
     *
     */
    function sine(Ctor, x) {
      var k,
        len = x.d.length;

      if (len < 3) {
        return x.isZero() ? x : taylorSeries(Ctor, 2, x, x);
      }

      // Argument reduction: sin(5x) = 16*sin^5(x) - 20*sin^3(x) + 5*sin(x)
      // i.e. sin(x) = 16*sin^5(x/5) - 20*sin^3(x/5) + 5*sin(x/5)
      // and  sin(x) = sin(x/5)(5 + sin^2(x/5)(16sin^2(x/5) - 20))

      // Estimate the optimum number of times to use the argument reduction.
      k = 1.4 * Math.sqrt(len);
      k = k > 16 ? 16 : k | 0;

      x = x.times(1 / tinyPow(5, k));
      x = taylorSeries(Ctor, 2, x, x);

      // Reverse argument reduction
      var sin2_x,
        d5 = new Ctor(5),
        d16 = new Ctor(16),
        d20 = new Ctor(20);
      for (; k--;) {
        sin2_x = x.times(x);
        x = x.times(d5.plus(sin2_x.times(d16.times(sin2_x).minus(d20))));
      }

      return x;
    }


    // Calculate Taylor series for `cos`, `cosh`, `sin` and `sinh`.
    function taylorSeries(Ctor, n, x, y, isHyperbolic) {
      var j, t, u, x2,
        pr = Ctor.precision,
        k = Math.ceil(pr / LOG_BASE);

      external = false;
      x2 = x.times(x);
      u = new Ctor(y);

      for (;;) {
        t = divide(u.times(x2), new Ctor(n++ * n++), pr, 1);
        u = isHyperbolic ? y.plus(t) : y.minus(t);
        y = divide(t.times(x2), new Ctor(n++ * n++), pr, 1);
        t = u.plus(y);

        if (t.d[k] !== void 0) {
          for (j = k; t.d[j] === u.d[j] && j--;);
          if (j == -1) break;
        }

        j = u;
        u = y;
        y = t;
        t = j;
      }

      external = true;
      t.d.length = k + 1;

      return t;
    }


    // Exponent e must be positive and non-zero.
    function tinyPow(b, e) {
      var n = b;
      while (--e) n *= b;
      return n;
    }


    // Return the absolute value of `x` reduced to less than or equal to half pi.
    function toLessThanHalfPi(Ctor, x) {
      var t,
        isNeg = x.s < 0,
        pi = getPi(Ctor, Ctor.precision, 1),
        halfPi = pi.times(0.5);

      x = x.abs();

      if (x.lte(halfPi)) {
        quadrant = isNeg ? 4 : 1;
        return x;
      }

      t = x.divToInt(pi);

      if (t.isZero()) {
        quadrant = isNeg ? 3 : 2;
      } else {
        x = x.minus(t.times(pi));

        // 0 <= x < pi
        if (x.lte(halfPi)) {
          quadrant = isOdd(t) ? (isNeg ? 2 : 3) : (isNeg ? 4 : 1);
          return x;
        }

        quadrant = isOdd(t) ? (isNeg ? 1 : 4) : (isNeg ? 3 : 2);
      }

      return x.minus(pi).abs();
    }


    /*
     * Return the value of Decimal `x` as a string in base `baseOut`.
     *
     * If the optional `sd` argument is present include a binary exponent suffix.
     */
    function toStringBinary(x, baseOut, sd, rm) {
      var base, e, i, k, len, roundUp, str, xd, y,
        Ctor = x.constructor,
        isExp = sd !== void 0;

      if (isExp) {
        checkInt32(sd, 1, MAX_DIGITS);
        if (rm === void 0) rm = Ctor.rounding;
        else checkInt32(rm, 0, 8);
      } else {
        sd = Ctor.precision;
        rm = Ctor.rounding;
      }

      if (!x.isFinite()) {
        str = nonFiniteToString(x);
      } else {
        str = finiteToString(x);
        i = str.indexOf('.');

        // Use exponential notation according to `toExpPos` and `toExpNeg`? No, but if required:
        // maxBinaryExponent = floor((decimalExponent + 1) * log[2](10))
        // minBinaryExponent = floor(decimalExponent * log[2](10))
        // log[2](10) = 3.321928094887362347870319429489390175864

        if (isExp) {
          base = 2;
          if (baseOut == 16) {
            sd = sd * 4 - 3;
          } else if (baseOut == 8) {
            sd = sd * 3 - 2;
          }
        } else {
          base = baseOut;
        }

        // Convert the number as an integer then divide the result by its base raised to a power such
        // that the fraction part will be restored.

        // Non-integer.
        if (i >= 0) {
          str = str.replace('.', '');
          y = new Ctor(1);
          y.e = str.length - i;
          y.d = convertBase(finiteToString(y), 10, base);
          y.e = y.d.length;
        }

        xd = convertBase(str, 10, base);
        e = len = xd.length;

        // Remove trailing zeros.
        for (; xd[--len] == 0;) xd.pop();

        if (!xd[0]) {
          str = isExp ? '0p+0' : '0';
        } else {
          if (i < 0) {
            e--;
          } else {
            x = new Ctor(x);
            x.d = xd;
            x.e = e;
            x = divide(x, y, sd, rm, 0, base);
            xd = x.d;
            e = x.e;
            roundUp = inexact;
          }

          // The rounding digit, i.e. the digit after the digit that may be rounded up.
          i = xd[sd];
          k = base / 2;
          roundUp = roundUp || xd[sd + 1] !== void 0;

          roundUp = rm < 4
            ? (i !== void 0 || roundUp) && (rm === 0 || rm === (x.s < 0 ? 3 : 2))
            : i > k || i === k && (rm === 4 || roundUp || rm === 6 && xd[sd - 1] & 1 ||
              rm === (x.s < 0 ? 8 : 7));

          xd.length = sd;

          if (roundUp) {

            // Rounding up may mean the previous digit has to be rounded up and so on.
            for (; ++xd[--sd] > base - 1;) {
              xd[sd] = 0;
              if (!sd) {
                ++e;
                xd.unshift(1);
              }
            }
          }

          // Determine trailing zeros.
          for (len = xd.length; !xd[len - 1]; --len);

          // E.g. [4, 11, 15] becomes 4bf.
          for (i = 0, str = ''; i < len; i++) str += NUMERALS.charAt(xd[i]);

          // Add binary exponent suffix?
          if (isExp) {
            if (len > 1) {
              if (baseOut == 16 || baseOut == 8) {
                i = baseOut == 16 ? 4 : 3;
                for (--len; len % i; len++) str += '0';
                xd = convertBase(str, base, baseOut);
                for (len = xd.length; !xd[len - 1]; --len);

                // xd[0] will always be be 1
                for (i = 1, str = '1.'; i < len; i++) str += NUMERALS.charAt(xd[i]);
              } else {
                str = str.charAt(0) + '.' + str.slice(1);
              }
            }

            str =  str + (e < 0 ? 'p' : 'p+') + e;
          } else if (e < 0) {
            for (; ++e;) str = '0' + str;
            str = '0.' + str;
          } else {
            if (++e > len) for (e -= len; e-- ;) str += '0';
            else if (e < len) str = str.slice(0, e) + '.' + str.slice(e);
          }
        }

        str = (baseOut == 16 ? '0x' : baseOut == 2 ? '0b' : baseOut == 8 ? '0o' : '') + str;
      }

      return x.s < 0 ? '-' + str : str;
    }


    // Does not strip trailing zeros.
    function truncate(arr, len) {
      if (arr.length > len) {
        arr.length = len;
        return true;
      }
    }


    // Decimal methods


    /*
     *  abs
     *  acos
     *  acosh
     *  add
     *  asin
     *  asinh
     *  atan
     *  atanh
     *  atan2
     *  cbrt
     *  ceil
     *  clamp
     *  clone
     *  config
     *  cos
     *  cosh
     *  div
     *  exp
     *  floor
     *  hypot
     *  ln
     *  log
     *  log2
     *  log10
     *  max
     *  min
     *  mod
     *  mul
     *  pow
     *  random
     *  round
     *  set
     *  sign
     *  sin
     *  sinh
     *  sqrt
     *  sub
     *  sum
     *  tan
     *  tanh
     *  trunc
     */


    /*
     * Return a new Decimal whose value is the absolute value of `x`.
     *
     * x {number|string|Decimal}
     *
     */
    function abs(x) {
      return new this(x).abs();
    }


    /*
     * Return a new Decimal whose value is the arccosine in radians of `x`.
     *
     * x {number|string|Decimal}
     *
     */
    function acos(x) {
      return new this(x).acos();
    }


    /*
     * Return a new Decimal whose value is the inverse of the hyperbolic cosine of `x`, rounded to
     * `precision` significant digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal} A value in radians.
     *
     */
    function acosh(x) {
      return new this(x).acosh();
    }


    /*
     * Return a new Decimal whose value is the sum of `x` and `y`, rounded to `precision` significant
     * digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal}
     * y {number|string|Decimal}
     *
     */
    function add(x, y) {
      return new this(x).plus(y);
    }


    /*
     * Return a new Decimal whose value is the arcsine in radians of `x`, rounded to `precision`
     * significant digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal}
     *
     */
    function asin(x) {
      return new this(x).asin();
    }


    /*
     * Return a new Decimal whose value is the inverse of the hyperbolic sine of `x`, rounded to
     * `precision` significant digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal} A value in radians.
     *
     */
    function asinh(x) {
      return new this(x).asinh();
    }


    /*
     * Return a new Decimal whose value is the arctangent in radians of `x`, rounded to `precision`
     * significant digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal}
     *
     */
    function atan(x) {
      return new this(x).atan();
    }


    /*
     * Return a new Decimal whose value is the inverse of the hyperbolic tangent of `x`, rounded to
     * `precision` significant digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal} A value in radians.
     *
     */
    function atanh(x) {
      return new this(x).atanh();
    }


    /*
     * Return a new Decimal whose value is the arctangent in radians of `y/x` in the range -pi to pi
     * (inclusive), rounded to `precision` significant digits using rounding mode `rounding`.
     *
     * Domain: [-Infinity, Infinity]
     * Range: [-pi, pi]
     *
     * y {number|string|Decimal} The y-coordinate.
     * x {number|string|Decimal} The x-coordinate.
     *
     * atan2(±0, -0)               = ±pi
     * atan2(±0, +0)               = ±0
     * atan2(±0, -x)               = ±pi for x > 0
     * atan2(±0, x)                = ±0 for x > 0
     * atan2(-y, ±0)               = -pi/2 for y > 0
     * atan2(y, ±0)                = pi/2 for y > 0
     * atan2(±y, -Infinity)        = ±pi for finite y > 0
     * atan2(±y, +Infinity)        = ±0 for finite y > 0
     * atan2(±Infinity, x)         = ±pi/2 for finite x
     * atan2(±Infinity, -Infinity) = ±3*pi/4
     * atan2(±Infinity, +Infinity) = ±pi/4
     * atan2(NaN, x) = NaN
     * atan2(y, NaN) = NaN
     *
     */
    function atan2(y, x) {
      y = new this(y);
      x = new this(x);
      var r,
        pr = this.precision,
        rm = this.rounding,
        wpr = pr + 4;

      // Either NaN
      if (!y.s || !x.s) {
        r = new this(NaN);

      // Both ±Infinity
      } else if (!y.d && !x.d) {
        r = getPi(this, wpr, 1).times(x.s > 0 ? 0.25 : 0.75);
        r.s = y.s;

      // x is ±Infinity or y is ±0
      } else if (!x.d || y.isZero()) {
        r = x.s < 0 ? getPi(this, pr, rm) : new this(0);
        r.s = y.s;

      // y is ±Infinity or x is ±0
      } else if (!y.d || x.isZero()) {
        r = getPi(this, wpr, 1).times(0.5);
        r.s = y.s;

      // Both non-zero and finite
      } else if (x.s < 0) {
        this.precision = wpr;
        this.rounding = 1;
        r = this.atan(divide(y, x, wpr, 1));
        x = getPi(this, wpr, 1);
        this.precision = pr;
        this.rounding = rm;
        r = y.s < 0 ? r.minus(x) : r.plus(x);
      } else {
        r = this.atan(divide(y, x, wpr, 1));
      }

      return r;
    }


    /*
     * Return a new Decimal whose value is the cube root of `x`, rounded to `precision` significant
     * digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal}
     *
     */
    function cbrt(x) {
      return new this(x).cbrt();
    }


    /*
     * Return a new Decimal whose value is `x` rounded to an integer using `ROUND_CEIL`.
     *
     * x {number|string|Decimal}
     *
     */
    function ceil(x) {
      return finalise(x = new this(x), x.e + 1, 2);
    }


    /*
     * Return a new Decimal whose value is `x` clamped to the range delineated by `min` and `max`.
     *
     * x {number|string|Decimal}
     * min {number|string|Decimal}
     * max {number|string|Decimal}
     *
     */
    function clamp(x, min, max) {
      return new this(x).clamp(min, max);
    }


    /*
     * Configure global settings for a Decimal constructor.
     *
     * `obj` is an object with one or more of the following properties,
     *
     *   precision  {number}
     *   rounding   {number}
     *   toExpNeg   {number}
     *   toExpPos   {number}
     *   maxE       {number}
     *   minE       {number}
     *   modulo     {number}
     *   crypto     {boolean|number}
     *   defaults   {true}
     *
     * E.g. Decimal.config({ precision: 20, rounding: 4 })
     *
     */
    function config(obj) {
      if (!obj || typeof obj !== 'object') throw Error(decimalError + 'Object expected');
      var i, p, v,
        useDefaults = obj.defaults === true,
        ps = [
          'precision', 1, MAX_DIGITS,
          'rounding', 0, 8,
          'toExpNeg', -EXP_LIMIT, 0,
          'toExpPos', 0, EXP_LIMIT,
          'maxE', 0, EXP_LIMIT,
          'minE', -EXP_LIMIT, 0,
          'modulo', 0, 9
        ];

      for (i = 0; i < ps.length; i += 3) {
        if (p = ps[i], useDefaults) this[p] = DEFAULTS[p];
        if ((v = obj[p]) !== void 0) {
          if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
          else throw Error(invalidArgument + p + ': ' + v);
        }
      }

      if (p = 'crypto', useDefaults) this[p] = DEFAULTS[p];
      if ((v = obj[p]) !== void 0) {
        if (v === true || v === false || v === 0 || v === 1) {
          if (v) {
            if (typeof crypto != 'undefined' && crypto &&
              (crypto.getRandomValues || crypto.randomBytes)) {
              this[p] = true;
            } else {
              throw Error(cryptoUnavailable);
            }
          } else {
            this[p] = false;
          }
        } else {
          throw Error(invalidArgument + p + ': ' + v);
        }
      }

      return this;
    }


    /*
     * Return a new Decimal whose value is the cosine of `x`, rounded to `precision` significant
     * digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal} A value in radians.
     *
     */
    function cos(x) {
      return new this(x).cos();
    }


    /*
     * Return a new Decimal whose value is the hyperbolic cosine of `x`, rounded to precision
     * significant digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal} A value in radians.
     *
     */
    function cosh(x) {
      return new this(x).cosh();
    }


    /*
     * Create and return a Decimal constructor with the same configuration properties as this Decimal
     * constructor.
     *
     */
    function clone(obj) {
      var i, p, ps;

      /*
       * The Decimal constructor and exported function.
       * Return a new Decimal instance.
       *
       * v {number|string|Decimal} A numeric value.
       *
       */
      function Decimal(v) {
        var e, i, t,
          x = this;

        // Decimal called without new.
        if (!(x instanceof Decimal)) return new Decimal(v);

        // Retain a reference to this Decimal constructor, and shadow Decimal.prototype.constructor
        // which points to Object.
        x.constructor = Decimal;

        // Duplicate.
        if (isDecimalInstance(v)) {
          x.s = v.s;

          if (external) {
            if (!v.d || v.e > Decimal.maxE) {

              // Infinity.
              x.e = NaN;
              x.d = null;
            } else if (v.e < Decimal.minE) {

              // Zero.
              x.e = 0;
              x.d = [0];
            } else {
              x.e = v.e;
              x.d = v.d.slice();
            }
          } else {
            x.e = v.e;
            x.d = v.d ? v.d.slice() : v.d;
          }

          return;
        }

        t = typeof v;

        if (t === 'number') {
          if (v === 0) {
            x.s = 1 / v < 0 ? -1 : 1;
            x.e = 0;
            x.d = [0];
            return;
          }

          if (v < 0) {
            v = -v;
            x.s = -1;
          } else {
            x.s = 1;
          }

          // Fast path for small integers.
          if (v === ~~v && v < 1e7) {
            for (e = 0, i = v; i >= 10; i /= 10) e++;

            if (external) {
              if (e > Decimal.maxE) {
                x.e = NaN;
                x.d = null;
              } else if (e < Decimal.minE) {
                x.e = 0;
                x.d = [0];
              } else {
                x.e = e;
                x.d = [v];
              }
            } else {
              x.e = e;
              x.d = [v];
            }

            return;

          // Infinity, NaN.
          } else if (v * 0 !== 0) {
            if (!v) x.s = NaN;
            x.e = NaN;
            x.d = null;
            return;
          }

          return parseDecimal(x, v.toString());

        } else if (t !== 'string') {
          throw Error(invalidArgument + v);
        }

        // Minus sign?
        if ((i = v.charCodeAt(0)) === 45) {
          v = v.slice(1);
          x.s = -1;
        } else {
          // Plus sign?
          if (i === 43) v = v.slice(1);
          x.s = 1;
        }

        return isDecimal.test(v) ? parseDecimal(x, v) : parseOther(x, v);
      }

      Decimal.prototype = P;

      Decimal.ROUND_UP = 0;
      Decimal.ROUND_DOWN = 1;
      Decimal.ROUND_CEIL = 2;
      Decimal.ROUND_FLOOR = 3;
      Decimal.ROUND_HALF_UP = 4;
      Decimal.ROUND_HALF_DOWN = 5;
      Decimal.ROUND_HALF_EVEN = 6;
      Decimal.ROUND_HALF_CEIL = 7;
      Decimal.ROUND_HALF_FLOOR = 8;
      Decimal.EUCLID = 9;

      Decimal.config = Decimal.set = config;
      Decimal.clone = clone;
      Decimal.isDecimal = isDecimalInstance;

      Decimal.abs = abs;
      Decimal.acos = acos;
      Decimal.acosh = acosh;        // ES6
      Decimal.add = add;
      Decimal.asin = asin;
      Decimal.asinh = asinh;        // ES6
      Decimal.atan = atan;
      Decimal.atanh = atanh;        // ES6
      Decimal.atan2 = atan2;
      Decimal.cbrt = cbrt;          // ES6
      Decimal.ceil = ceil;
      Decimal.clamp = clamp;
      Decimal.cos = cos;
      Decimal.cosh = cosh;          // ES6
      Decimal.div = div;
      Decimal.exp = exp;
      Decimal.floor = floor;
      Decimal.hypot = hypot;        // ES6
      Decimal.ln = ln;
      Decimal.log = log;
      Decimal.log10 = log10;        // ES6
      Decimal.log2 = log2;          // ES6
      Decimal.max = max;
      Decimal.min = min;
      Decimal.mod = mod;
      Decimal.mul = mul;
      Decimal.pow = pow;
      Decimal.random = random;
      Decimal.round = round;
      Decimal.sign = sign;          // ES6
      Decimal.sin = sin;
      Decimal.sinh = sinh;          // ES6
      Decimal.sqrt = sqrt;
      Decimal.sub = sub;
      Decimal.sum = sum;
      Decimal.tan = tan;
      Decimal.tanh = tanh;          // ES6
      Decimal.trunc = trunc;        // ES6

      if (obj === void 0) obj = {};
      if (obj) {
        if (obj.defaults !== true) {
          ps = ['precision', 'rounding', 'toExpNeg', 'toExpPos', 'maxE', 'minE', 'modulo', 'crypto'];
          for (i = 0; i < ps.length;) if (!obj.hasOwnProperty(p = ps[i++])) obj[p] = this[p];
        }
      }

      Decimal.config(obj);

      return Decimal;
    }


    /*
     * Return a new Decimal whose value is `x` divided by `y`, rounded to `precision` significant
     * digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal}
     * y {number|string|Decimal}
     *
     */
    function div(x, y) {
      return new this(x).div(y);
    }


    /*
     * Return a new Decimal whose value is the natural exponential of `x`, rounded to `precision`
     * significant digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal} The power to which to raise the base of the natural log.
     *
     */
    function exp(x) {
      return new this(x).exp();
    }


    /*
     * Return a new Decimal whose value is `x` round to an integer using `ROUND_FLOOR`.
     *
     * x {number|string|Decimal}
     *
     */
    function floor(x) {
      return finalise(x = new this(x), x.e + 1, 3);
    }


    /*
     * Return a new Decimal whose value is the square root of the sum of the squares of the arguments,
     * rounded to `precision` significant digits using rounding mode `rounding`.
     *
     * hypot(a, b, ...) = sqrt(a^2 + b^2 + ...)
     *
     * arguments {number|string|Decimal}
     *
     */
    function hypot() {
      var i, n,
        t = new this(0);

      external = false;

      for (i = 0; i < arguments.length;) {
        n = new this(arguments[i++]);
        if (!n.d) {
          if (n.s) {
            external = true;
            return new this(1 / 0);
          }
          t = n;
        } else if (t.d) {
          t = t.plus(n.times(n));
        }
      }

      external = true;

      return t.sqrt();
    }


    /*
     * Return true if object is a Decimal instance (where Decimal is any Decimal constructor),
     * otherwise return false.
     *
     */
    function isDecimalInstance(obj) {
      return obj instanceof Decimal || obj && obj.toStringTag === tag || false;
    }


    /*
     * Return a new Decimal whose value is the natural logarithm of `x`, rounded to `precision`
     * significant digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal}
     *
     */
    function ln(x) {
      return new this(x).ln();
    }


    /*
     * Return a new Decimal whose value is the log of `x` to the base `y`, or to base 10 if no base
     * is specified, rounded to `precision` significant digits using rounding mode `rounding`.
     *
     * log[y](x)
     *
     * x {number|string|Decimal} The argument of the logarithm.
     * y {number|string|Decimal} The base of the logarithm.
     *
     */
    function log(x, y) {
      return new this(x).log(y);
    }


    /*
     * Return a new Decimal whose value is the base 2 logarithm of `x`, rounded to `precision`
     * significant digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal}
     *
     */
    function log2(x) {
      return new this(x).log(2);
    }


    /*
     * Return a new Decimal whose value is the base 10 logarithm of `x`, rounded to `precision`
     * significant digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal}
     *
     */
    function log10(x) {
      return new this(x).log(10);
    }


    /*
     * Return a new Decimal whose value is the maximum of the arguments.
     *
     * arguments {number|string|Decimal}
     *
     */
    function max() {
      return maxOrMin(this, arguments, 'lt');
    }


    /*
     * Return a new Decimal whose value is the minimum of the arguments.
     *
     * arguments {number|string|Decimal}
     *
     */
    function min() {
      return maxOrMin(this, arguments, 'gt');
    }


    /*
     * Return a new Decimal whose value is `x` modulo `y`, rounded to `precision` significant digits
     * using rounding mode `rounding`.
     *
     * x {number|string|Decimal}
     * y {number|string|Decimal}
     *
     */
    function mod(x, y) {
      return new this(x).mod(y);
    }


    /*
     * Return a new Decimal whose value is `x` multiplied by `y`, rounded to `precision` significant
     * digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal}
     * y {number|string|Decimal}
     *
     */
    function mul(x, y) {
      return new this(x).mul(y);
    }


    /*
     * Return a new Decimal whose value is `x` raised to the power `y`, rounded to precision
     * significant digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal} The base.
     * y {number|string|Decimal} The exponent.
     *
     */
    function pow(x, y) {
      return new this(x).pow(y);
    }


    /*
     * Returns a new Decimal with a random value equal to or greater than 0 and less than 1, and with
     * `sd`, or `Decimal.precision` if `sd` is omitted, significant digits (or less if trailing zeros
     * are produced).
     *
     * [sd] {number} Significant digits. Integer, 0 to MAX_DIGITS inclusive.
     *
     */
    function random(sd) {
      var d, e, k, n,
        i = 0,
        r = new this(1),
        rd = [];

      if (sd === void 0) sd = this.precision;
      else checkInt32(sd, 1, MAX_DIGITS);

      k = Math.ceil(sd / LOG_BASE);

      if (!this.crypto) {
        for (; i < k;) rd[i++] = Math.random() * 1e7 | 0;

      // Browsers supporting crypto.getRandomValues.
      } else if (crypto.getRandomValues) {
        d = crypto.getRandomValues(new Uint32Array(k));

        for (; i < k;) {
          n = d[i];

          // 0 <= n < 4294967296
          // Probability n >= 4.29e9, is 4967296 / 4294967296 = 0.00116 (1 in 865).
          if (n >= 4.29e9) {
            d[i] = crypto.getRandomValues(new Uint32Array(1))[0];
          } else {

            // 0 <= n <= 4289999999
            // 0 <= (n % 1e7) <= 9999999
            rd[i++] = n % 1e7;
          }
        }

      // Node.js supporting crypto.randomBytes.
      } else if (crypto.randomBytes) {

        // buffer
        d = crypto.randomBytes(k *= 4);

        for (; i < k;) {

          // 0 <= n < 2147483648
          n = d[i] + (d[i + 1] << 8) + (d[i + 2] << 16) + ((d[i + 3] & 0x7f) << 24);

          // Probability n >= 2.14e9, is 7483648 / 2147483648 = 0.0035 (1 in 286).
          if (n >= 2.14e9) {
            crypto.randomBytes(4).copy(d, i);
          } else {

            // 0 <= n <= 2139999999
            // 0 <= (n % 1e7) <= 9999999
            rd.push(n % 1e7);
            i += 4;
          }
        }

        i = k / 4;
      } else {
        throw Error(cryptoUnavailable);
      }

      k = rd[--i];
      sd %= LOG_BASE;

      // Convert trailing digits to zeros according to sd.
      if (k && sd) {
        n = mathpow(10, LOG_BASE - sd);
        rd[i] = (k / n | 0) * n;
      }

      // Remove trailing words which are zero.
      for (; rd[i] === 0; i--) rd.pop();

      // Zero?
      if (i < 0) {
        e = 0;
        rd = [0];
      } else {
        e = -1;

        // Remove leading words which are zero and adjust exponent accordingly.
        for (; rd[0] === 0; e -= LOG_BASE) rd.shift();

        // Count the digits of the first word of rd to determine leading zeros.
        for (k = 1, n = rd[0]; n >= 10; n /= 10) k++;

        // Adjust the exponent for leading zeros of the first word of rd.
        if (k < LOG_BASE) e -= LOG_BASE - k;
      }

      r.e = e;
      r.d = rd;

      return r;
    }


    /*
     * Return a new Decimal whose value is `x` rounded to an integer using rounding mode `rounding`.
     *
     * To emulate `Math.round`, set rounding to 7 (ROUND_HALF_CEIL).
     *
     * x {number|string|Decimal}
     *
     */
    function round(x) {
      return finalise(x = new this(x), x.e + 1, this.rounding);
    }


    /*
     * Return
     *   1    if x > 0,
     *  -1    if x < 0,
     *   0    if x is 0,
     *  -0    if x is -0,
     *   NaN  otherwise
     *
     * x {number|string|Decimal}
     *
     */
    function sign(x) {
      x = new this(x);
      return x.d ? (x.d[0] ? x.s : 0 * x.s) : x.s || NaN;
    }


    /*
     * Return a new Decimal whose value is the sine of `x`, rounded to `precision` significant digits
     * using rounding mode `rounding`.
     *
     * x {number|string|Decimal} A value in radians.
     *
     */
    function sin(x) {
      return new this(x).sin();
    }


    /*
     * Return a new Decimal whose value is the hyperbolic sine of `x`, rounded to `precision`
     * significant digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal} A value in radians.
     *
     */
    function sinh(x) {
      return new this(x).sinh();
    }


    /*
     * Return a new Decimal whose value is the square root of `x`, rounded to `precision` significant
     * digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal}
     *
     */
    function sqrt(x) {
      return new this(x).sqrt();
    }


    /*
     * Return a new Decimal whose value is `x` minus `y`, rounded to `precision` significant digits
     * using rounding mode `rounding`.
     *
     * x {number|string|Decimal}
     * y {number|string|Decimal}
     *
     */
    function sub(x, y) {
      return new this(x).sub(y);
    }


    /*
     * Return a new Decimal whose value is the sum of the arguments, rounded to `precision`
     * significant digits using rounding mode `rounding`.
     *
     * Only the result is rounded, not the intermediate calculations.
     *
     * arguments {number|string|Decimal}
     *
     */
    function sum() {
      var i = 0,
        args = arguments,
        x = new this(args[i]);

      external = false;
      for (; x.s && ++i < args.length;) x = x.plus(args[i]);
      external = true;

      return finalise(x, this.precision, this.rounding);
    }


    /*
     * Return a new Decimal whose value is the tangent of `x`, rounded to `precision` significant
     * digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal} A value in radians.
     *
     */
    function tan(x) {
      return new this(x).tan();
    }


    /*
     * Return a new Decimal whose value is the hyperbolic tangent of `x`, rounded to `precision`
     * significant digits using rounding mode `rounding`.
     *
     * x {number|string|Decimal} A value in radians.
     *
     */
    function tanh(x) {
      return new this(x).tanh();
    }


    /*
     * Return a new Decimal whose value is `x` truncated to an integer.
     *
     * x {number|string|Decimal}
     *
     */
    function trunc(x) {
      return finalise(x = new this(x), x.e + 1, 1);
    }


    P[Symbol.for('nodejs.util.inspect.custom')] = P.toString;
    P[Symbol.toStringTag] = 'Decimal';

    // Create and configure initial Decimal constructor.
    var Decimal = P.constructor = clone(DEFAULTS);

    // Create the internal constants from their string values.
    LN10 = new Decimal(LN10);
    PI = new Decimal(PI);

    /* src\Components\ProgressBar.svelte generated by Svelte v3.55.0 */

    const file$8 = "src\\Components\\ProgressBar.svelte";

    function create_fragment$8(ctx) {
    	let div1;
    	let div0;
    	let t0_value = (/*width*/ ctx[0] * 100).toFixed(2) + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = text("%");
    			attr_dev(div0, "class", "bar svelte-58u87w");
    			set_style(div0, "width", /*width*/ ctx[0] * 100 + "%");
    			add_location(div0, file$8, 5, 4, 78);
    			attr_dev(div1, "class", "progress svelte-58u87w");
    			add_location(div1, file$8, 4, 0, 50);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*width*/ 1 && t0_value !== (t0_value = (/*width*/ ctx[0] * 100).toFixed(2) + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*width*/ 1) {
    				set_style(div0, "width", /*width*/ ctx[0] * 100 + "%");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ProgressBar', slots, []);
    	let { width = 0 } = $$props;
    	const writable_props = ['width'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ProgressBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    	};

    	$$self.$capture_state = () => ({ width });

    	$$self.$inject_state = $$props => {
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width];
    }

    class ProgressBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { width: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProgressBar",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get width() {
    		throw new Error("<ProgressBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<ProgressBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function Format(number, places = 2){
        if (number.lt(0)){
            return "-" + Format(number.abs(), places);
        }

        var numberNames = ["","K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"];

        var index = Math.floor(Math.log10(number) / 3);
        if (index >= numberNames.length) return number.toExponential(places);
        if (index < 0) return number.toFixed(places);

        var number = Decimal.div(number, Decimal.pow(1000, index));
        return number.toFixed(places) + numberNames[index];
    }

    function FormatTimeLong(seconds){
        var values = [52*24*3600*7, 24*3600*7, 24*3600, 3600, 60, 1];
        var prefixes = ["years","weeks","days","hours","minutes","seconds"];

        var outcome = [];

        var str = "";

        for (var i = 0; i < values.length; i++){
            if (seconds > values[i]){
                outcome[i] = Math.floor(seconds / values[i]);
                seconds -= outcome[i] * values[i];
                str += `${outcome[i]} ${prefixes[i]} `;
            }
        }

        return str;
    }

    function FormatTimeShort(seconds){
        var values = [52*24*3600*7, 24*3600*7, 24*3600, 3600, 60, 1];
        var prefixes = ["y","w","d","h","m","s"];

        var outcome = [];

        var str = "";

        for (var i = 0; i < values.length; i++){
            if (seconds > values[i]){
                outcome[i] = Math.floor(seconds / values[i]);
                seconds -= outcome[i] * values[i];
                str += `${outcome[i]}${prefixes[i]} `;
            }
        }

        return str;
    }

    /**
     * price + (price * increase) + (price * increase ^ 2) + ... + (price * increase ^ amount)
     * @param {Current starting price} price 
     * @param {Multiplier for purchase} increase 
     * @param {How many we want to buy} amount 
     * @returns Returns the total price for the amount of items
     */
    function SumGeometric(price, increase, amount){
        // a(1-r^n)/(1-r)
        // price * (1 - increase ^ amount) / (1 - increase)
        let first = Decimal.sub(1, Decimal.pow(increase, amount));
        let second = Decimal.sub(1, increase);
        return Decimal.mul(price, Decimal.div(first, second));
    }

    /**
     * price + (price * increase) + (price * increase ^ 2) + ... <= currentMoney
     * @param {Current starting price} price 
     * @param {Multiplier for purchase} increase 
     * @param {How much money we have} currentMoney 
     * @returns How many we can buy
     */
    function CountGeometric(price, increase, currentMoney){
        // logr(1-(S(1-r)/a));
        let _ = Decimal.div(Decimal.mul(currentMoney, Decimal.sub(1, increase)), price);
        let out = Decimal.log10(Decimal.sub(1, _)).div(Decimal.log10(increase));

        if (out.lte(0)) return new Decimal(0);
        return out.floor();
    }

    /* src\Components\UpgradeButton.svelte generated by Svelte v3.55.0 */
    const file$7 = "src\\Components\\UpgradeButton.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let button;
    	let p0;
    	let t0;
    	let t1;
    	let p1;
    	let t2;
    	let t3;
    	let t4_value = Format(/*price*/ ctx[1]) + "";
    	let t4;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			p0 = element("p");
    			t0 = text(/*description*/ ctx[0]);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(/*effect*/ ctx[2]);
    			t3 = space();
    			t4 = text(t4_value);
    			attr_dev(p0, "class", "text-2xl");
    			add_location(p0, file$7, 36, 8, 874);
    			attr_dev(p1, "class", "text-lg");
    			add_location(p1, file$7, 37, 8, 921);
    			attr_dev(button, "class", button_class_value = "button " + (/*money*/ ctx[3].gte(/*price*/ ctx[1]) ? 'can-buy' : '') + " svelte-p02kyl");
    			add_location(button, file$7, 35, 4, 788);
    			attr_dev(div, "class", "container");
    			add_location(div, file$7, 34, 0, 759);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, p0);
    			append_dev(p0, t0);
    			append_dev(button, t1);
    			append_dev(button, p1);
    			append_dev(p1, t2);
    			append_dev(button, t3);
    			append_dev(button, t4);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*click*/ ctx[4])) /*click*/ ctx[4].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*description*/ 1) set_data_dev(t0, /*description*/ ctx[0]);
    			if (dirty & /*effect*/ 4) set_data_dev(t2, /*effect*/ ctx[2]);
    			if (dirty & /*price*/ 2 && t4_value !== (t4_value = Format(/*price*/ ctx[1]) + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*money, price*/ 10 && button_class_value !== (button_class_value = "button " + (/*money*/ ctx[3].gte(/*price*/ ctx[1]) ? 'can-buy' : '') + " svelte-p02kyl")) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UpgradeButton', slots, []);
    	let { description = "No description" } = $$props;
    	let { price = new Decimal(10) } = $$props;
    	let { effect = "No effect" } = $$props;
    	let { money = new Decimal(0) } = $$props;

    	let { click = () => {
    		
    	} } = $$props;

    	const writable_props = ['description', 'price', 'effect', 'money', 'click'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UpgradeButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('description' in $$props) $$invalidate(0, description = $$props.description);
    		if ('price' in $$props) $$invalidate(1, price = $$props.price);
    		if ('effect' in $$props) $$invalidate(2, effect = $$props.effect);
    		if ('money' in $$props) $$invalidate(3, money = $$props.money);
    		if ('click' in $$props) $$invalidate(4, click = $$props.click);
    	};

    	$$self.$capture_state = () => ({
    		Decimal,
    		Format,
    		description,
    		price,
    		effect,
    		money,
    		click
    	});

    	$$self.$inject_state = $$props => {
    		if ('description' in $$props) $$invalidate(0, description = $$props.description);
    		if ('price' in $$props) $$invalidate(1, price = $$props.price);
    		if ('effect' in $$props) $$invalidate(2, effect = $$props.effect);
    		if ('money' in $$props) $$invalidate(3, money = $$props.money);
    		if ('click' in $$props) $$invalidate(4, click = $$props.click);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [description, price, effect, money, click];
    }

    class UpgradeButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			description: 0,
    			price: 1,
    			effect: 2,
    			money: 3,
    			click: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UpgradeButton",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get description() {
    		throw new Error("<UpgradeButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<UpgradeButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get price() {
    		throw new Error("<UpgradeButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set price(value) {
    		throw new Error("<UpgradeButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get effect() {
    		throw new Error("<UpgradeButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set effect(value) {
    		throw new Error("<UpgradeButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get money() {
    		throw new Error("<UpgradeButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set money(value) {
    		throw new Error("<UpgradeButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get click() {
    		throw new Error("<UpgradeButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set click(value) {
    		throw new Error("<UpgradeButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /*
    Adapted from https://github.com/mattdesl
    Distributed under MIT License https://github.com/mattdesl/eases/blob/master/LICENSE.md
    */
    function backInOut(t) {
        const s = 1.70158 * 1.525;
        if ((t *= 2) < 1)
            return 0.5 * (t * t * ((s + 1) * t - s));
        return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src\Components\ResourceDisplay.svelte generated by Svelte v3.55.0 */
    const file$6 = "src\\Components\\ResourceDisplay.svelte";

    // (67:4) {:else}
    function create_else_block_1(ctx) {
    	let i;
    	let t0;
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			i = element("i");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "???";
    			attr_dev(i, "class", "icon locked svelte-1y8btjn");
    			add_location(i, file$6, 67, 4, 1776);
    			attr_dev(div0, "class", "description orange svelte-1y8btjn");
    			add_location(div0, file$6, 69, 8, 1840);
    			attr_dev(div1, "class", "content svelte-1y8btjn");
    			add_location(div1, file$6, 68, 4, 1809);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(67:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (46:4) {#if resource.unlocked}
    function create_if_block$2(ctx) {
    	let i;
    	let t0_value = /*resource*/ ctx[0].icon + "";
    	let t0;
    	let t1;
    	let div3;
    	let div2;
    	let div0;
    	let show_if_2;
    	let t2;
    	let div1;
    	let show_if;
    	let show_if_1;
    	let current_block_type_index;
    	let if_block1;
    	let div3_transition;
    	let current;

    	function select_block_type_1(ctx, dirty) {
    		if (dirty & /*resource*/ 1) show_if_2 = null;
    		if (show_if_2 == null) show_if_2 = !!/*resource*/ ctx[0].amount.gte(/*resource*/ ctx[0].amountMax);
    		if (show_if_2) return create_if_block_3$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx, -1);
    	let if_block0 = current_block_type(ctx);
    	const if_block_creators = [create_if_block_1$1, create_if_block_2$1];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (dirty & /*resource*/ 1) show_if = null;
    		if (dirty & /*resource*/ 1) show_if_1 = null;
    		if (show_if == null) show_if = !!/*resource*/ ctx[0].perSecond.gt(0);
    		if (show_if) return 0;
    		if (show_if_1 == null) show_if_1 = !!/*resource*/ ctx[0].perSecond.lt(0);
    		if (show_if_1) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_2(ctx, -1))) {
    		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			i = element("i");
    			t0 = text(t0_value);
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t2 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(i, "class", "icon svelte-1y8btjn");
    			add_location(i, file$6, 46, 4, 756);
    			attr_dev(div0, "class", "column");
    			add_location(div0, file$6, 49, 12, 920);
    			attr_dev(div1, "class", "column");
    			add_location(div1, file$6, 56, 12, 1282);
    			attr_dev(div2, "class", "ui grid two columns");
    			add_location(div2, file$6, 48, 8, 873);
    			attr_dev(div3, "class", "content svelte-1y8btjn");
    			add_location(div3, file$6, 47, 4, 797);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			append_dev(i, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			if_block0.m(div0, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*resource*/ 1) && t0_value !== (t0_value = /*resource*/ ctx[0].icon + "")) set_data_dev(t0, t0_value);

    			if (current_block_type === (current_block_type = select_block_type_1(ctx, dirty)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block1) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block1 = if_blocks[current_block_type_index];

    					if (!if_block1) {
    						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block1.c();
    					} else {
    						if_block1.p(ctx, dirty);
    					}

    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				} else {
    					if_block1 = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fly, { x: 100, easing: backInOut }, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fly, { x: 100, easing: backInOut }, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div3);
    			if_block0.d();

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (detaching && div3_transition) div3_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(46:4) {#if resource.unlocked}",
    		ctx
    	});

    	return block;
    }

    // (53:16) {:else}
    function create_else_block(ctx) {
    	let a;
    	let t0_value = Format(/*resource*/ ctx[0].amount, /*places*/ ctx[1]) + "";
    	let t0;
    	let t1;
    	let t2_value = Format(/*resource*/ ctx[0].amountMax, 0) + "";
    	let t2;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = text(" / ");
    			t2 = text(t2_value);
    			attr_dev(a, "class", "header");
    			add_location(a, file$6, 53, 20, 1137);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			append_dev(a, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resource, places*/ 3 && t0_value !== (t0_value = Format(/*resource*/ ctx[0].amount, /*places*/ ctx[1]) + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*resource*/ 1 && t2_value !== (t2_value = Format(/*resource*/ ctx[0].amountMax, 0) + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(53:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (51:16) {#if resource.amount.gte(resource.amountMax)}
    function create_if_block_3$1(ctx) {
    	let div;
    	let t0_value = Format(/*resource*/ ctx[0].amount, 0) + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(" (MAX)");
    			attr_dev(div, "class", "description red svelte-1y8btjn");
    			add_location(div, file$6, 51, 16, 1021);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*resource*/ 1 && t0_value !== (t0_value = Format(/*resource*/ ctx[0].amount, 0) + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(51:16) {#if resource.amount.gte(resource.amountMax)}",
    		ctx
    	});

    	return block;
    }

    // (60:51) 
    function create_if_block_2$1(ctx) {
    	let span;
    	let t0_value = Format(/*resource*/ ctx[0].perSecond) + "";
    	let t0;
    	let t1;
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(" /s");
    			attr_dev(span, "class", "description red svelte-1y8btjn");
    			add_location(span, file$6, 60, 20, 1563);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*resource*/ 1) && t0_value !== (t0_value = Format(/*resource*/ ctx[0].perSecond) + "")) set_data_dev(t0, t0_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fly, { x: 100, easing: backInOut }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fly, { x: 100, easing: backInOut }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(60:51) ",
    		ctx
    	});

    	return block;
    }

    // (58:16) {#if resource.perSecond.gt(0)}
    function create_if_block_1$1(ctx) {
    	let span;
    	let t0;
    	let t1_value = Format(/*resource*/ ctx[0].perSecond) + "";
    	let t1;
    	let t2;
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("+");
    			t1 = text(t1_value);
    			t2 = text(" /s");
    			attr_dev(span, "class", "description green svelte-1y8btjn");
    			add_location(span, file$6, 58, 20, 1372);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*resource*/ 1) && t1_value !== (t1_value = Format(/*resource*/ ctx[0].perSecond) + "")) set_data_dev(t1, t1_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fly, { x: 100, easing: backInOut }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fly, { x: 100, easing: backInOut }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(58:16) {#if resource.perSecond.gt(0)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*resource*/ ctx[0].unlocked) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "item");
    			add_location(div, file$6, 44, 0, 703);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ResourceDisplay', slots, []);
    	let { resource = null } = $$props;
    	let { places = 2 } = $$props;
    	const writable_props = ['resource', 'places'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ResourceDisplay> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('resource' in $$props) $$invalidate(0, resource = $$props.resource);
    		if ('places' in $$props) $$invalidate(1, places = $$props.places);
    	};

    	$$self.$capture_state = () => ({ Format, fly, backInOut, resource, places });

    	$$self.$inject_state = $$props => {
    		if ('resource' in $$props) $$invalidate(0, resource = $$props.resource);
    		if ('places' in $$props) $$invalidate(1, places = $$props.places);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [resource, places];
    }

    class ResourceDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { resource: 0, places: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResourceDisplay",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get resource() {
    		throw new Error("<ResourceDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set resource(value) {
    		throw new Error("<ResourceDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get places() {
    		throw new Error("<ResourceDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set places(value) {
    		throw new Error("<ResourceDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\MenuItem.svelte generated by Svelte v3.55.0 */
    const file$5 = "src\\Components\\MenuItem.svelte";

    // (19:4) {#if notificationCount > 0}
    function create_if_block$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*notificationCount*/ ctx[1]);
    			attr_dev(div, "class", "ui red label floating");
    			add_location(div, file$5, 19, 8, 379);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*notificationCount*/ 2) set_data_dev(t, /*notificationCount*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(19:4) {#if notificationCount > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let a;
    	let t0;
    	let t1;
    	let a_class_value;
    	let a_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*notificationCount*/ ctx[1] > 0 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(a, "class", a_class_value = "" + (null_to_empty(`item ${!/*unlocked*/ ctx[2] && "hidden"}`) + " svelte-faysjt"));
    			add_location(a, file$5, 16, 0, 255);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			if (if_block) if_block.m(a, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (/*notificationCount*/ ctx[1] > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(a, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty & /*unlocked*/ 4 && a_class_value !== (a_class_value = "" + (null_to_empty(`item ${!/*unlocked*/ ctx[2] && "hidden"}`) + " svelte-faysjt"))) {
    				attr_dev(a, "class", a_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!a_transition) a_transition = create_bidirectional_transition(a, fade, {}, true);
    				a_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!a_transition) a_transition = create_bidirectional_transition(a, fade, {}, false);
    			a_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (if_block) if_block.d();
    			if (detaching && a_transition) a_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MenuItem', slots, []);
    	let { title = "No Title" } = $$props;
    	let { notificationCount = 0 } = $$props;
    	let { unlocked } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (unlocked === undefined && !('unlocked' in $$props || $$self.$$.bound[$$self.$$.props['unlocked']])) {
    			console.warn("<MenuItem> was created without expected prop 'unlocked'");
    		}
    	});

    	const writable_props = ['title', 'notificationCount', 'unlocked'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MenuItem> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('notificationCount' in $$props) $$invalidate(1, notificationCount = $$props.notificationCount);
    		if ('unlocked' in $$props) $$invalidate(2, unlocked = $$props.unlocked);
    	};

    	$$self.$capture_state = () => ({ fade, title, notificationCount, unlocked });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('notificationCount' in $$props) $$invalidate(1, notificationCount = $$props.notificationCount);
    		if ('unlocked' in $$props) $$invalidate(2, unlocked = $$props.unlocked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, notificationCount, unlocked, click_handler];
    }

    class MenuItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			title: 0,
    			notificationCount: 1,
    			unlocked: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MenuItem",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get title() {
    		throw new Error("<MenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<MenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get notificationCount() {
    		throw new Error("<MenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set notificationCount(value) {
    		throw new Error("<MenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unlocked() {
    		throw new Error("<MenuItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unlocked(value) {
    		throw new Error("<MenuItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Achievement.svelte generated by Svelte v3.55.0 */

    const file$4 = "src\\Components\\Achievement.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t1;
    	let div1_class_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = text(/*name*/ ctx[0]);
    			if (!src_url_equal(img.src, img_src_value = "https://picsum.photos/200/200")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-1isnubd");
    			add_location(img, file$4, 41, 4, 853);
    			attr_dev(div0, "title", /*description*/ ctx[1]);
    			attr_dev(div0, "class", "id svelte-1isnubd");
    			add_location(div0, file$4, 42, 4, 900);
    			attr_dev(div1, "class", div1_class_value = "box " + (/*completed*/ ctx[2] ? "completed" : "") + " svelte-1isnubd");
    			add_location(div1, file$4, 40, 0, 799);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);

    			if (dirty & /*description*/ 2) {
    				attr_dev(div0, "title", /*description*/ ctx[1]);
    			}

    			if (dirty & /*completed*/ 4 && div1_class_value !== (div1_class_value = "box " + (/*completed*/ ctx[2] ? "completed" : "") + " svelte-1isnubd")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Achievement', slots, []);
    	let { name = "Back to Reality Or not?" } = $$props;
    	let { description = "Complete the game" } = $$props;
    	let { completed = false } = $$props;
    	const writable_props = ['name', 'description', 'completed'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Achievement> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('description' in $$props) $$invalidate(1, description = $$props.description);
    		if ('completed' in $$props) $$invalidate(2, completed = $$props.completed);
    	};

    	$$self.$capture_state = () => ({ name, description, completed });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('description' in $$props) $$invalidate(1, description = $$props.description);
    		if ('completed' in $$props) $$invalidate(2, completed = $$props.completed);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, description, completed];
    }

    class Achievement extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { name: 0, description: 1, completed: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Achievement",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get name() {
    		throw new Error("<Achievement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Achievement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<Achievement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Achievement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get completed() {
    		throw new Error("<Achievement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set completed(value) {
    		throw new Error("<Achievement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Menus\AchievementMenu.svelte generated by Svelte v3.55.0 */
    const file$3 = "src\\Components\\Menus\\AchievementMenu.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	child_ctx[2] = i;
    	return child_ctx;
    }

    // (22:4) {#each Array(100) as _, i}
    function create_each_block(ctx) {
    	let achievement;
    	let current;

    	achievement = new Achievement({
    			props: {
    				completed: Math.random() < 0.5,
    				title: "Some description",
    				name: /*i*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(achievement.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(achievement, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(achievement.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(achievement.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(achievement, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(22:4) {#each Array(100) as _, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div0;
    	let t1;
    	let div1;
    	let current;
    	let each_value = Array(100);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Achievements";
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "ui block header");
    			add_location(div0, file$3, 18, 0, 318);
    			attr_dev(div1, "class", "achievements svelte-6sf83b");
    			add_location(div1, file$3, 20, 0, 369);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Math*/ 0) {
    				each_value = Array(100);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AchievementMenu', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AchievementMenu> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Achievement });
    	return [];
    }

    class AchievementMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AchievementMenu",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const defaultPlayer = {
    	lastUpdate: Date.now(),
    	timePlayed: 0,

    	lastSaved: 0,

    	menu: "Government",

    	currentAge: 0,

    	menuTabs: {
    		automation: false,
    		upgrades: false,
    		construction: false,
    		military: false,
    		research: false,
    		trade: false,
    		government: true,
    		achievements: true,
    	},

    	workers: {
    		farmers: {
    			icon: "👨‍🌾",
    			amount: new Decimal(0),
    			unlocked: true,
    		},
    		woodcutters: {
    			icon: "🪓",
    			amount: new Decimal(0),
    			unlocked: false,
    		},
    		miners: {
    			icon: "⛏️",
    			amount: new Decimal(0),
    			unlocked: false,
    		},
    		blacksmiths: {
    			icon: "🛠️",
    			amount: new Decimal(0),
    			unlocked: false,
    		},
    	},
    	
    	resources: {
    		people: {
    			icon: "👨‍👩‍👧‍👦",
    			amount: new Decimal(3),
    			amountMax: new Decimal(100),
    			perSecond: new Decimal(0),
    			unlocked: true,
    		},
    		food: {
    			icon: "🍲",
    			amount: new Decimal(10),
    			amountMax: new Decimal(100),
    			perSecond: new Decimal(0),
    			unlocked: true,
    		},
    		wood: {
    			icon: "🌲",
    			amount: new Decimal(0),
    			amountMax: new Decimal(100),
    			perSecond: new Decimal(0),
    			unlocked: false,
    		},
    		stone: {
    			icon: "🪨",
    			amount: new Decimal(0),
    			amountMax: new Decimal(100),
    			perSecond: new Decimal(0),
    			unlocked: false,
    		},
    		ore: {
    			icon: "💎",
    			amount: new Decimal(0),
    			amountMax: new Decimal(100),
    			perSecond: new Decimal(0),
    			unlocked: false,
    		},
    		herbs: {
    			icon: "🌱",
    			amount: new Decimal(0),
    			amountMax: new Decimal(100),
    			perSecond: new Decimal(0),
    			unlocked: false,
    		},
    		livestock: {
    			icon: "🐄",
    			amount: new Decimal(0),
    			amountMax: new Decimal(100),
    			perSecond: new Decimal(0),
    			unlocked: false,
    		},
    		money: {
    			icon: "💰",
    			amount: new Decimal(0),
    			amountMax: new Decimal(100),
    			perSecond: new Decimal(0),
    			unlocked: true,
    		}
    	}
    };

    let player = writable(defaultPlayer);

    function Save(){
        var string = JSON.stringify(get_store_value(player), Replacer);
        localStorage.setItem("player", string);
    }

    function Replacer(key, value){
        console.log(value instanceof Decimal);
        if (value instanceof Decimal) return "d"+value.toJSON();

        return value;
    }

    function Load(){
        var string = localStorage.getItem("player");
        if (string == null) return;

        var data = JSON.parse(string, (key, value) => {
            if (typeof value === "object" && value[0] == "d"){
                return new Decimal(value.slice(1));
            }
            return value;
        });

        player.set(data);
    }

    /* src\Components\Menus\SettingsMenu.svelte generated by Svelte v3.55.0 */
    const file$2 = "src\\Components\\Menus\\SettingsMenu.svelte";

    function create_fragment$2(ctx) {
    	let div0;
    	let t1;
    	let div2;
    	let div1;
    	let t2;
    	let t3_value = FormatTimeShort(/*$player*/ ctx[0].timePlayed) + "";
    	let t3;
    	let t4;
    	let t5;
    	let button0;
    	let t6;
    	let i0;
    	let t7;
    	let button1;
    	let t8;
    	let i1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Settings";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			t2 = text("Last saved: ");
    			t3 = text(t3_value);
    			t4 = text(" ago");
    			t5 = space();
    			button0 = element("button");
    			t6 = text("Save ");
    			i0 = element("i");
    			t7 = space();
    			button1 = element("button");
    			t8 = text("Load ");
    			i1 = element("i");
    			attr_dev(div0, "class", "ui block header");
    			add_location(div0, file$2, 9, 0, 235);
    			attr_dev(div1, "class", "ui button basic");
    			add_location(div1, file$2, 12, 4, 317);
    			attr_dev(i0, "class", "download icon");
    			add_location(i0, file$2, 13, 51, 458);
    			attr_dev(button0, "class", "ui button");
    			add_location(button0, file$2, 13, 4, 411);
    			attr_dev(i1, "class", "upload icon");
    			add_location(i1, file$2, 14, 51, 549);
    			attr_dev(button1, "class", "ui button");
    			add_location(button1, file$2, 14, 4, 502);
    			attr_dev(div2, "class", "ui buttons icon");
    			add_location(div2, file$2, 11, 0, 282);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    			append_dev(div1, t4);
    			append_dev(div2, t5);
    			append_dev(div2, button0);
    			append_dev(button0, t6);
    			append_dev(button0, i0);
    			append_dev(div2, t7);
    			append_dev(div2, button1);
    			append_dev(button1, t8);
    			append_dev(button1, i1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", Save, false, false, false),
    					listen_dev(button1, "click", Load, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$player*/ 1 && t3_value !== (t3_value = FormatTimeShort(/*$player*/ ctx[0].timePlayed) + "")) set_data_dev(t3, t3_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $player;
    	validate_store(player, 'player');
    	component_subscribe($$self, player, $$value => $$invalidate(0, $player = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SettingsMenu', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SettingsMenu> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		player,
    		FormatTimeShort,
    		Save,
    		Load,
    		$player
    	});

    	return [$player];
    }

    class SettingsMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SettingsMenu",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    function FoodProduction(farmerCount){
        return Decimal.mul(farmerCount, 0.1);
    }

    function FarmerPrice(farmerCount){
        return new Decimal(10).mul(Decimal.pow(1.3, farmerCount));
    }

    function PurchaseFarmer(amount){
        var playerData = get_store_value(player);

        var farmerCount = playerData.workers.farmers.amount;

        var howManyWeCanBuy = CountGeometric(FarmerPrice(farmerCount), 1.3, playerData.resources.money.amount);

        if (howManyWeCanBuy.lt(amount)) amount = howManyWeCanBuy;

        var price = SumGeometric(FarmerPrice(0), 1.3, amount);

        playerData.resources.money.amount = playerData.resources.money.amount.sub(price);
        playerData.workers.farmers.amount = playerData.workers.farmers.amount.add(amount);
    }

    /* src\Components\Menus\GovernmentMenu.svelte generated by Svelte v3.55.0 */
    const file$1 = "src\\Components\\Menus\\GovernmentMenu.svelte";

    function create_fragment$1(ctx) {
    	let div0;
    	let t1;
    	let div3;
    	let div1;
    	let upgradebutton0;
    	let t2;
    	let div2;
    	let upgradebutton1;
    	let current;

    	upgradebutton0 = new UpgradeButton({
    			props: {
    				click: /*func*/ ctx[1],
    				description: "Farmer",
    				effect: `Food production: ${Format(/*$player*/ ctx[0].resources.food.perSecond)} → ${Format(FoodProduction(/*$player*/ ctx[0].workers.farmers.amount.add(1)))}`,
    				price: FarmerPrice(/*$player*/ ctx[0].workers.farmers.amount),
    				money: /*$player*/ ctx[0].resources.money.amount
    			},
    			$$inline: true
    		});

    	upgradebutton1 = new UpgradeButton({
    			props: {
    				click: /*func_1*/ ctx[2],
    				description: "Farmer",
    				effect: `Food production: ${Format(/*$player*/ ctx[0].resources.food.perSecond)} → ${Format(FoodProduction(/*$player*/ ctx[0].workers.farmers.amount.add(1)))}`,
    				price: FarmerPrice(/*$player*/ ctx[0].workers.farmers.amount),
    				money: /*$player*/ ctx[0].resources.money.amount,
    				hasAutoClicker: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Government";
    			t1 = space();
    			div3 = element("div");
    			div1 = element("div");
    			create_component(upgradebutton0.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			create_component(upgradebutton1.$$.fragment);
    			attr_dev(div0, "class", "ui block header");
    			add_location(div0, file$1, 11, 0, 281);
    			attr_dev(div1, "class", "column");
    			add_location(div1, file$1, 14, 4, 370);
    			attr_dev(div2, "class", "column");
    			add_location(div2, file$1, 20, 4, 791);
    			attr_dev(div3, "class", "ui grid four columns");
    			add_location(div3, file$1, 13, 0, 330);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			mount_component(upgradebutton0, div1, null);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			mount_component(upgradebutton1, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const upgradebutton0_changes = {};
    			if (dirty & /*$player*/ 1) upgradebutton0_changes.effect = `Food production: ${Format(/*$player*/ ctx[0].resources.food.perSecond)} → ${Format(FoodProduction(/*$player*/ ctx[0].workers.farmers.amount.add(1)))}`;
    			if (dirty & /*$player*/ 1) upgradebutton0_changes.price = FarmerPrice(/*$player*/ ctx[0].workers.farmers.amount);
    			if (dirty & /*$player*/ 1) upgradebutton0_changes.money = /*$player*/ ctx[0].resources.money.amount;
    			upgradebutton0.$set(upgradebutton0_changes);
    			const upgradebutton1_changes = {};
    			if (dirty & /*$player*/ 1) upgradebutton1_changes.effect = `Food production: ${Format(/*$player*/ ctx[0].resources.food.perSecond)} → ${Format(FoodProduction(/*$player*/ ctx[0].workers.farmers.amount.add(1)))}`;
    			if (dirty & /*$player*/ 1) upgradebutton1_changes.price = FarmerPrice(/*$player*/ ctx[0].workers.farmers.amount);
    			if (dirty & /*$player*/ 1) upgradebutton1_changes.money = /*$player*/ ctx[0].resources.money.amount;
    			upgradebutton1.$set(upgradebutton1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(upgradebutton0.$$.fragment, local);
    			transition_in(upgradebutton1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(upgradebutton0.$$.fragment, local);
    			transition_out(upgradebutton1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div3);
    			destroy_component(upgradebutton0);
    			destroy_component(upgradebutton1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $player;
    	validate_store(player, 'player');
    	component_subscribe($$self, player, $$value => $$invalidate(0, $player = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GovernmentMenu', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GovernmentMenu> was created with unknown prop '${key}'`);
    	});

    	const func = () => PurchaseFarmer(1);
    	const func_1 = () => PurchaseFarmer(1);

    	$$self.$capture_state = () => ({
    		UpgradeButton,
    		player,
    		FoodProduction,
    		FarmerPrice,
    		PurchaseFarmer,
    		Format,
    		$player
    	});

    	return [$player, func, func_1];
    }

    class GovernmentMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GovernmentMenu",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.55.0 */
    const file = "src\\App.svelte";

    // (154:42) 
    function create_if_block_8(ctx) {
    	let settingsmenu;
    	let current;
    	settingsmenu = new SettingsMenu({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(settingsmenu.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(settingsmenu, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(settingsmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(settingsmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(settingsmenu, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(154:42) ",
    		ctx
    	});

    	return block;
    }

    // (152:46) 
    function create_if_block_7(ctx) {
    	let achievementmenu;
    	let current;
    	achievementmenu = new AchievementMenu({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(achievementmenu.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(achievementmenu, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(achievementmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(achievementmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(achievementmenu, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(152:46) ",
    		ctx
    	});

    	return block;
    }

    // (150:44) 
    function create_if_block_6(ctx) {
    	let governmentmenu;
    	let current;
    	governmentmenu = new GovernmentMenu({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(governmentmenu.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(governmentmenu, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(governmentmenu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(governmentmenu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(governmentmenu, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(150:44) ",
    		ctx
    	});

    	return block;
    }

    // (148:39) 
    function create_if_block_5(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(148:39) ",
    		ctx
    	});

    	return block;
    }

    // (146:42) 
    function create_if_block_4(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(146:42) ",
    		ctx
    	});

    	return block;
    }

    // (144:42) 
    function create_if_block_3(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(144:42) ",
    		ctx
    	});

    	return block;
    }

    // (142:46) 
    function create_if_block_2(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(142:46) ",
    		ctx
    	});

    	return block;
    }

    // (140:42) 
    function create_if_block_1(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(140:42) ",
    		ctx
    	});

    	return block;
    }

    // (138:5) {#if $player.menu == "Automation"}
    function create_if_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(138:5) {#if $player.menu == \\\"Automation\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let link0;
    	let t0;
    	let link1;
    	let t1;
    	let link2;
    	let t2;
    	let link3;
    	let t3;
    	let link4;
    	let t4;
    	let script;
    	let script_src_value;
    	let t5;
    	let div1;
    	let div0;
    	let t7;
    	let input;
    	let t8;
    	let div10;
    	let div3;
    	let menuitem0;
    	let t9;
    	let menuitem1;
    	let t10;
    	let menuitem2;
    	let t11;
    	let menuitem3;
    	let t12;
    	let menuitem4;
    	let t13;
    	let menuitem5;
    	let t14;
    	let menuitem6;
    	let t15;
    	let menuitem7;
    	let t16;
    	let div2;
    	let menuitem8;
    	let t17;
    	let menuitem9;
    	let t18;
    	let a;
    	let t19;
    	let t20_value = FormatTimeShort(/*$player*/ ctx[1].timePlayed) + "";
    	let t20;
    	let t21;
    	let div9;
    	let div6;
    	let div5;
    	let div4;
    	let resourcedisplay0;
    	let t22;
    	let resourcedisplay1;
    	let t23;
    	let resourcedisplay2;
    	let t24;
    	let resourcedisplay3;
    	let t25;
    	let resourcedisplay4;
    	let t26;
    	let resourcedisplay5;
    	let t27;
    	let resourcedisplay6;
    	let t28;
    	let resourcedisplay7;
    	let t29;
    	let div8;
    	let div7;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;

    	menuitem0 = new MenuItem({
    			props: {
    				title: /*allAges*/ ctx[2][/*$player*/ ctx[1].currentAge],
    				unlocked: true
    			},
    			$$inline: true
    		});

    	menuitem0.$on("click", click_handler);

    	menuitem1 = new MenuItem({
    			props: {
    				title: "🤖 Automation",
    				unlocked: /*$player*/ ctx[1].menuTabs.automation
    			},
    			$$inline: true
    		});

    	menuitem1.$on("click", /*click_handler_1*/ ctx[5]);

    	menuitem2 = new MenuItem({
    			props: {
    				title: "🛠️ Construction",
    				unlocked: /*$player*/ ctx[1].menuTabs.construction
    			},
    			$$inline: true
    		});

    	menuitem2.$on("click", /*click_handler_2*/ ctx[6]);

    	menuitem3 = new MenuItem({
    			props: {
    				title: "🏛️ Government",
    				unlocked: /*$player*/ ctx[1].menuTabs.government
    			},
    			$$inline: true
    		});

    	menuitem3.$on("click", /*click_handler_3*/ ctx[7]);

    	menuitem4 = new MenuItem({
    			props: {
    				title: "⚔️ Military",
    				unlocked: /*$player*/ ctx[1].menuTabs.military
    			},
    			$$inline: true
    		});

    	menuitem4.$on("click", /*click_handler_4*/ ctx[8]);

    	menuitem5 = new MenuItem({
    			props: {
    				title: "📜 Research",
    				unlocked: /*$player*/ ctx[1].menuTabs.research
    			},
    			$$inline: true
    		});

    	menuitem5.$on("click", /*click_handler_5*/ ctx[9]);

    	menuitem6 = new MenuItem({
    			props: {
    				title: "🏦 Trade",
    				unlocked: /*$player*/ ctx[1].menuTabs.trade
    			},
    			$$inline: true
    		});

    	menuitem6.$on("click", /*click_handler_6*/ ctx[10]);

    	menuitem7 = new MenuItem({
    			props: {
    				title: "🔧 Upgrades",
    				unlocked: /*$player*/ ctx[1].menuTabs.upgrades
    			},
    			$$inline: true
    		});

    	menuitem7.$on("click", /*click_handler_7*/ ctx[11]);

    	menuitem8 = new MenuItem({
    			props: { title: "🏆 Achievements", unlocked: true },
    			$$inline: true
    		});

    	menuitem8.$on("click", /*click_handler_8*/ ctx[12]);

    	menuitem9 = new MenuItem({
    			props: { title: "⚙️ Settings", unlocked: true },
    			$$inline: true
    		});

    	menuitem9.$on("click", /*click_handler_9*/ ctx[13]);

    	resourcedisplay0 = new ResourceDisplay({
    			props: {
    				resource: /*$player*/ ctx[1].resources.money
    			},
    			$$inline: true
    		});

    	resourcedisplay1 = new ResourceDisplay({
    			props: {
    				resource: /*$player*/ ctx[1].resources.people,
    				places: 0
    			},
    			$$inline: true
    		});

    	resourcedisplay2 = new ResourceDisplay({
    			props: {
    				resource: /*$player*/ ctx[1].resources.food
    			},
    			$$inline: true
    		});

    	resourcedisplay3 = new ResourceDisplay({
    			props: {
    				resource: /*$player*/ ctx[1].resources.wood
    			},
    			$$inline: true
    		});

    	resourcedisplay4 = new ResourceDisplay({
    			props: {
    				resource: /*$player*/ ctx[1].resources.stone
    			},
    			$$inline: true
    		});

    	resourcedisplay5 = new ResourceDisplay({
    			props: {
    				resource: /*$player*/ ctx[1].resources.ore
    			},
    			$$inline: true
    		});

    	resourcedisplay6 = new ResourceDisplay({
    			props: {
    				resource: /*$player*/ ctx[1].resources.herbs
    			},
    			$$inline: true
    		});

    	resourcedisplay7 = new ResourceDisplay({
    			props: {
    				resource: /*$player*/ ctx[1].resources.livestock
    			},
    			$$inline: true
    		});

    	const if_block_creators = [
    		create_if_block,
    		create_if_block_1,
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4,
    		create_if_block_5,
    		create_if_block_6,
    		create_if_block_7,
    		create_if_block_8
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$player*/ ctx[1].menu == "Automation") return 0;
    		if (/*$player*/ ctx[1].menu == "Upgrades") return 1;
    		if (/*$player*/ ctx[1].menu == "Construction") return 2;
    		if (/*$player*/ ctx[1].menu == "Military") return 3;
    		if (/*$player*/ ctx[1].menu == "Research") return 4;
    		if (/*$player*/ ctx[1].menu == "Trade") return 5;
    		if (/*$player*/ ctx[1].menu == "Government") return 6;
    		if (/*$player*/ ctx[1].menu == "Achievements") return 7;
    		if (/*$player*/ ctx[1].menu == "Settings") return 8;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			link0 = element("link");
    			t0 = space();
    			link1 = element("link");
    			t1 = space();
    			link2 = element("link");
    			t2 = space();
    			link3 = element("link");
    			t3 = space();
    			link4 = element("link");
    			t4 = space();
    			script = element("script");
    			t5 = space();
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Game Speed";
    			t7 = space();
    			input = element("input");
    			t8 = space();
    			div10 = element("div");
    			div3 = element("div");
    			create_component(menuitem0.$$.fragment);
    			t9 = space();
    			create_component(menuitem1.$$.fragment);
    			t10 = space();
    			create_component(menuitem2.$$.fragment);
    			t11 = space();
    			create_component(menuitem3.$$.fragment);
    			t12 = space();
    			create_component(menuitem4.$$.fragment);
    			t13 = space();
    			create_component(menuitem5.$$.fragment);
    			t14 = space();
    			create_component(menuitem6.$$.fragment);
    			t15 = space();
    			create_component(menuitem7.$$.fragment);
    			t16 = space();
    			div2 = element("div");
    			create_component(menuitem8.$$.fragment);
    			t17 = space();
    			create_component(menuitem9.$$.fragment);
    			t18 = space();
    			a = element("a");
    			t19 = text("Played for ");
    			t20 = text(t20_value);
    			t21 = space();
    			div9 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			create_component(resourcedisplay0.$$.fragment);
    			t22 = space();
    			create_component(resourcedisplay1.$$.fragment);
    			t23 = space();
    			create_component(resourcedisplay2.$$.fragment);
    			t24 = space();
    			create_component(resourcedisplay3.$$.fragment);
    			t25 = space();
    			create_component(resourcedisplay4.$$.fragment);
    			t26 = space();
    			create_component(resourcedisplay5.$$.fragment);
    			t27 = space();
    			create_component(resourcedisplay6.$$.fragment);
    			t28 = space();
    			create_component(resourcedisplay7.$$.fragment);
    			t29 = space();
    			div8 = element("div");
    			div7 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(link0, "async", "");
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", "https://cdn.jsdelivr.net/npm/semantic-ui@2/dist/semantic.min.css");
    			attr_dev(link0, "class", "svelte-11fxuh8");
    			add_location(link0, file, 88, 1, 2296);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "https://raw.githubusercontent.com/silvio-r/spop/gh-pages/dist/spop.min.css");
    			attr_dev(link1, "class", "svelte-11fxuh8");
    			add_location(link1, file, 90, 1, 2401);
    			attr_dev(link2, "rel", "preconnect");
    			attr_dev(link2, "href", "https://fonts.googleapis.com");
    			attr_dev(link2, "class", "svelte-11fxuh8");
    			add_location(link2, file, 92, 1, 2509);
    			attr_dev(link3, "rel", "preconnect");
    			attr_dev(link3, "href", "https://fonts.gstatic.com");
    			attr_dev(link3, "crossorigin", "");
    			attr_dev(link3, "class", "svelte-11fxuh8");
    			add_location(link3, file, 93, 1, 2570);
    			attr_dev(link4, "href", "https://fonts.googleapis.com/css2?family=Roboto&display=swap");
    			attr_dev(link4, "rel", "stylesheet");
    			attr_dev(link4, "class", "svelte-11fxuh8");
    			add_location(link4, file, 94, 1, 2640);
    			if (!src_url_equal(script.src, script_src_value = "https://cdn.tailwindcss.com")) attr_dev(script, "src", script_src_value);
    			attr_dev(script, "class", "svelte-11fxuh8");
    			add_location(script, file, 96, 1, 2734);
    			attr_dev(div0, "class", "ui label svelte-11fxuh8");
    			add_location(div0, file, 99, 2, 2825);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "class", "svelte-11fxuh8");
    			add_location(input, file, 100, 2, 2866);
    			attr_dev(div1, "class", "ui input labeled big svelte-11fxuh8");
    			add_location(div1, file, 98, 1, 2788);
    			attr_dev(a, "class", "item svelte-11fxuh8");
    			add_location(a, file, 117, 4, 4098);
    			attr_dev(div2, "class", "right menu svelte-11fxuh8");
    			add_location(div2, file, 114, 3, 3881);
    			attr_dev(div3, "class", "ui secondary pointing menu svelte-11fxuh8");
    			add_location(div3, file, 104, 2, 2962);
    			attr_dev(div4, "class", "ui relaxed divided big list svelte-11fxuh8");
    			add_location(div4, file, 123, 5, 4278);
    			attr_dev(div5, "class", "ui segment svelte-11fxuh8");
    			add_location(div5, file, 122, 4, 4248);
    			attr_dev(div6, "class", "four wide column svelte-11fxuh8");
    			add_location(div6, file, 121, 3, 4213);
    			attr_dev(div7, "class", "ui segment basic padded svelte-11fxuh8");
    			add_location(div7, file, 136, 4, 4893);
    			attr_dev(div8, "class", "twelve wide column svelte-11fxuh8");
    			add_location(div8, file, 135, 3, 4856);
    			attr_dev(div9, "class", "ui grid svelte-11fxuh8");
    			add_location(div9, file, 120, 2, 4188);
    			attr_dev(div10, "class", "ui segment basic padded svelte-11fxuh8");
    			add_location(div10, file, 103, 1, 2922);
    			attr_dev(main, "class", "svelte-11fxuh8");
    			add_location(main, file, 87, 0, 2288);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, link0);
    			append_dev(main, t0);
    			append_dev(main, link1);
    			append_dev(main, t1);
    			append_dev(main, link2);
    			append_dev(main, t2);
    			append_dev(main, link3);
    			append_dev(main, t3);
    			append_dev(main, link4);
    			append_dev(main, t4);
    			append_dev(main, script);
    			append_dev(main, t5);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t7);
    			append_dev(div1, input);
    			set_input_value(input, /*game_speed*/ ctx[0]);
    			append_dev(main, t8);
    			append_dev(main, div10);
    			append_dev(div10, div3);
    			mount_component(menuitem0, div3, null);
    			append_dev(div3, t9);
    			mount_component(menuitem1, div3, null);
    			append_dev(div3, t10);
    			mount_component(menuitem2, div3, null);
    			append_dev(div3, t11);
    			mount_component(menuitem3, div3, null);
    			append_dev(div3, t12);
    			mount_component(menuitem4, div3, null);
    			append_dev(div3, t13);
    			mount_component(menuitem5, div3, null);
    			append_dev(div3, t14);
    			mount_component(menuitem6, div3, null);
    			append_dev(div3, t15);
    			mount_component(menuitem7, div3, null);
    			append_dev(div3, t16);
    			append_dev(div3, div2);
    			mount_component(menuitem8, div2, null);
    			append_dev(div2, t17);
    			mount_component(menuitem9, div2, null);
    			append_dev(div2, t18);
    			append_dev(div2, a);
    			append_dev(a, t19);
    			append_dev(a, t20);
    			append_dev(div10, t21);
    			append_dev(div10, div9);
    			append_dev(div9, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			mount_component(resourcedisplay0, div4, null);
    			append_dev(div4, t22);
    			mount_component(resourcedisplay1, div4, null);
    			append_dev(div4, t23);
    			mount_component(resourcedisplay2, div4, null);
    			append_dev(div4, t24);
    			mount_component(resourcedisplay3, div4, null);
    			append_dev(div4, t25);
    			mount_component(resourcedisplay4, div4, null);
    			append_dev(div4, t26);
    			mount_component(resourcedisplay5, div4, null);
    			append_dev(div4, t27);
    			mount_component(resourcedisplay6, div4, null);
    			append_dev(div4, t28);
    			mount_component(resourcedisplay7, div4, null);
    			append_dev(div9, t29);
    			append_dev(div9, div8);
    			append_dev(div8, div7);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div7, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*game_speed*/ 1 && to_number(input.value) !== /*game_speed*/ ctx[0]) {
    				set_input_value(input, /*game_speed*/ ctx[0]);
    			}

    			const menuitem0_changes = {};
    			if (dirty & /*$player*/ 2) menuitem0_changes.title = /*allAges*/ ctx[2][/*$player*/ ctx[1].currentAge];
    			menuitem0.$set(menuitem0_changes);
    			const menuitem1_changes = {};
    			if (dirty & /*$player*/ 2) menuitem1_changes.unlocked = /*$player*/ ctx[1].menuTabs.automation;
    			menuitem1.$set(menuitem1_changes);
    			const menuitem2_changes = {};
    			if (dirty & /*$player*/ 2) menuitem2_changes.unlocked = /*$player*/ ctx[1].menuTabs.construction;
    			menuitem2.$set(menuitem2_changes);
    			const menuitem3_changes = {};
    			if (dirty & /*$player*/ 2) menuitem3_changes.unlocked = /*$player*/ ctx[1].menuTabs.government;
    			menuitem3.$set(menuitem3_changes);
    			const menuitem4_changes = {};
    			if (dirty & /*$player*/ 2) menuitem4_changes.unlocked = /*$player*/ ctx[1].menuTabs.military;
    			menuitem4.$set(menuitem4_changes);
    			const menuitem5_changes = {};
    			if (dirty & /*$player*/ 2) menuitem5_changes.unlocked = /*$player*/ ctx[1].menuTabs.research;
    			menuitem5.$set(menuitem5_changes);
    			const menuitem6_changes = {};
    			if (dirty & /*$player*/ 2) menuitem6_changes.unlocked = /*$player*/ ctx[1].menuTabs.trade;
    			menuitem6.$set(menuitem6_changes);
    			const menuitem7_changes = {};
    			if (dirty & /*$player*/ 2) menuitem7_changes.unlocked = /*$player*/ ctx[1].menuTabs.upgrades;
    			menuitem7.$set(menuitem7_changes);
    			if ((!current || dirty & /*$player*/ 2) && t20_value !== (t20_value = FormatTimeShort(/*$player*/ ctx[1].timePlayed) + "")) set_data_dev(t20, t20_value);
    			const resourcedisplay0_changes = {};
    			if (dirty & /*$player*/ 2) resourcedisplay0_changes.resource = /*$player*/ ctx[1].resources.money;
    			resourcedisplay0.$set(resourcedisplay0_changes);
    			const resourcedisplay1_changes = {};
    			if (dirty & /*$player*/ 2) resourcedisplay1_changes.resource = /*$player*/ ctx[1].resources.people;
    			resourcedisplay1.$set(resourcedisplay1_changes);
    			const resourcedisplay2_changes = {};
    			if (dirty & /*$player*/ 2) resourcedisplay2_changes.resource = /*$player*/ ctx[1].resources.food;
    			resourcedisplay2.$set(resourcedisplay2_changes);
    			const resourcedisplay3_changes = {};
    			if (dirty & /*$player*/ 2) resourcedisplay3_changes.resource = /*$player*/ ctx[1].resources.wood;
    			resourcedisplay3.$set(resourcedisplay3_changes);
    			const resourcedisplay4_changes = {};
    			if (dirty & /*$player*/ 2) resourcedisplay4_changes.resource = /*$player*/ ctx[1].resources.stone;
    			resourcedisplay4.$set(resourcedisplay4_changes);
    			const resourcedisplay5_changes = {};
    			if (dirty & /*$player*/ 2) resourcedisplay5_changes.resource = /*$player*/ ctx[1].resources.ore;
    			resourcedisplay5.$set(resourcedisplay5_changes);
    			const resourcedisplay6_changes = {};
    			if (dirty & /*$player*/ 2) resourcedisplay6_changes.resource = /*$player*/ ctx[1].resources.herbs;
    			resourcedisplay6.$set(resourcedisplay6_changes);
    			const resourcedisplay7_changes = {};
    			if (dirty & /*$player*/ 2) resourcedisplay7_changes.resource = /*$player*/ ctx[1].resources.livestock;
    			resourcedisplay7.$set(resourcedisplay7_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(div7, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menuitem0.$$.fragment, local);
    			transition_in(menuitem1.$$.fragment, local);
    			transition_in(menuitem2.$$.fragment, local);
    			transition_in(menuitem3.$$.fragment, local);
    			transition_in(menuitem4.$$.fragment, local);
    			transition_in(menuitem5.$$.fragment, local);
    			transition_in(menuitem6.$$.fragment, local);
    			transition_in(menuitem7.$$.fragment, local);
    			transition_in(menuitem8.$$.fragment, local);
    			transition_in(menuitem9.$$.fragment, local);
    			transition_in(resourcedisplay0.$$.fragment, local);
    			transition_in(resourcedisplay1.$$.fragment, local);
    			transition_in(resourcedisplay2.$$.fragment, local);
    			transition_in(resourcedisplay3.$$.fragment, local);
    			transition_in(resourcedisplay4.$$.fragment, local);
    			transition_in(resourcedisplay5.$$.fragment, local);
    			transition_in(resourcedisplay6.$$.fragment, local);
    			transition_in(resourcedisplay7.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menuitem0.$$.fragment, local);
    			transition_out(menuitem1.$$.fragment, local);
    			transition_out(menuitem2.$$.fragment, local);
    			transition_out(menuitem3.$$.fragment, local);
    			transition_out(menuitem4.$$.fragment, local);
    			transition_out(menuitem5.$$.fragment, local);
    			transition_out(menuitem6.$$.fragment, local);
    			transition_out(menuitem7.$$.fragment, local);
    			transition_out(menuitem8.$$.fragment, local);
    			transition_out(menuitem9.$$.fragment, local);
    			transition_out(resourcedisplay0.$$.fragment, local);
    			transition_out(resourcedisplay1.$$.fragment, local);
    			transition_out(resourcedisplay2.$$.fragment, local);
    			transition_out(resourcedisplay3.$$.fragment, local);
    			transition_out(resourcedisplay4.$$.fragment, local);
    			transition_out(resourcedisplay5.$$.fragment, local);
    			transition_out(resourcedisplay6.$$.fragment, local);
    			transition_out(resourcedisplay7.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(menuitem0);
    			destroy_component(menuitem1);
    			destroy_component(menuitem2);
    			destroy_component(menuitem3);
    			destroy_component(menuitem4);
    			destroy_component(menuitem5);
    			destroy_component(menuitem6);
    			destroy_component(menuitem7);
    			destroy_component(menuitem8);
    			destroy_component(menuitem9);
    			destroy_component(resourcedisplay0);
    			destroy_component(resourcedisplay1);
    			destroy_component(resourcedisplay2);
    			destroy_component(resourcedisplay3);
    			destroy_component(resourcedisplay4);
    			destroy_component(resourcedisplay5);
    			destroy_component(resourcedisplay6);
    			destroy_component(resourcedisplay7);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const fps = 30;

    function ResourceTick(res, tick) {
    	if (res.amount.lt(res.amountMax)) {
    		res.amount = res.amount.add(res.perSecond.mul(tick));
    	}

    	res.amount = res.amount.add(res.perSecond.mul(tick));
    	res.amount = res.amount.clamp(0, res.amountMax);
    }

    function CheckUnlocks() {
    	
    }

    const click_handler = () => {
    	
    };

    function instance($$self, $$props, $$invalidate) {
    	let $player;
    	validate_store(player, 'player');
    	component_subscribe($$self, player, $$value => $$invalidate(1, $player = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	const allAges = [
    		"Prehistoric",
    		"Ancient",
    		"Classical",
    		"Medieval",
    		"Renaissance",
    		"Industrial",
    		"Modern",
    		"Post-modern",
    		"Futuristic",
    		"Space Colonization",
    		"Post-Singularity",
    		"Transhumanism",
    		"Post-Scarcity",
    		"Intergalactic",
    		"Virtual Reality",
    		"Time Travel",
    		"Transdimensional"
    	];

    	const dt = 1 / fps;
    	var game_speed = 1;

    	function loop() {
    		set_store_value(player, $player.lastUpdate = Date.now(), $player);
    		TimeTick(dt * game_speed);
    		setTimeout(loop, dt * 1000);
    	}

    	loop();

    	function TimeTick(tick) {
    		set_store_value(player, $player.timePlayed += tick, $player);
    		PeopleTick();
    		MoneyTick();
    		WorkersTick();
    		ResourceTick($player.resources.people, tick);
    		ResourceTick($player.resources.money, tick);
    		ResourceTick($player.resources.food, tick);
    	}

    	function PeopleTick() {
    		var foodBonus = Decimal.log($player.resources.food.amount.add(1), 3);
    		set_store_value(player, $player.resources.people.perSecond = $player.resources.people.amount.mul(0.01).mul(foodBonus), $player);
    	}

    	function MoneyTick() {
    		var moneyPerSec = $player.resources.people.amount.mul(0.1);
    		set_store_value(player, $player.resources.money.perSecond = moneyPerSec, $player);
    	}

    	function WorkersTick(dt) {
    		var workers = $player.workers;
    		var res = $player.resources;

    		// farmers
    		res.food.perSecond = FoodProduction(workers.farmers.amount);
    	}

    	function OpenMenu(name) {
    		set_store_value(player, $player.menu = name, $player);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		game_speed = to_number(this.value);
    		$$invalidate(0, game_speed);
    	}

    	const click_handler_1 = () => OpenMenu("Automation");
    	const click_handler_2 = () => OpenMenu("Construction");
    	const click_handler_3 = () => OpenMenu("Government");
    	const click_handler_4 = () => OpenMenu("Military");
    	const click_handler_5 = () => OpenMenu("Research");
    	const click_handler_6 = () => OpenMenu("Trade");
    	const click_handler_7 = () => OpenMenu("Upgrades");
    	const click_handler_8 = () => OpenMenu("Achievements");
    	const click_handler_9 = () => OpenMenu("Settings");

    	$$self.$capture_state = () => ({
    		Decimal,
    		ProgressBar,
    		UpgradeButton,
    		Format,
    		FormatTimeLong,
    		FormatTimeShort,
    		ResourceDisplay,
    		MenuItem,
    		AchievementMenu,
    		SettingsMenu,
    		GovernmentMenu,
    		player,
    		FoodProduction,
    		allAges,
    		fps,
    		dt,
    		game_speed,
    		loop,
    		TimeTick,
    		PeopleTick,
    		MoneyTick,
    		WorkersTick,
    		ResourceTick,
    		CheckUnlocks,
    		OpenMenu,
    		$player
    	});

    	$$self.$inject_state = $$props => {
    		if ('game_speed' in $$props) $$invalidate(0, game_speed = $$props.game_speed);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		game_speed,
    		$player,
    		allAges,
    		OpenMenu,
    		input_input_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
