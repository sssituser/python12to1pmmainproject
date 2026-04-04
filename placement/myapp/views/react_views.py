import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def playground_questions_react_api(request):
    """
    Serve a 25-question React MCQ set for the playground exams.
    """
    questions_pool = [
        {"id": 1, "question": "What does the virtual DOM improve in React?", "options": ["Security", "Performance via minimal DOM updates", "Styling", "Testing"], "correct": 1},
        {"id": 2, "question": "Which hook manages local component state?", "options": ["useEffect", "useState", "useMemo", "useRef"], "correct": 1},
        {"id": 3, "question": "Keys in lists should be:", "options": ["Random each render", "Stable and unique among siblings", "Optional", "Same for all items"], "correct": 1},
        {"id": 4, "question": "Which hook replaces componentDidMount in function components?", "options": ["useEffect", "useCallback", "useLayoutEffect", "useReducer"], "correct": 0},
        {"id": 5, "question": "What does useMemo memoize?", "options": ["Components", "Expensive calculations", "Events", "Styles"], "correct": 1},
        {"id": 6, "question": "What does useCallback return?", "options": ["A memoized value", "A memoized function", "A ref", "A reducer"], "correct": 1},
        {"id": 7, "question": "useRef is useful for:", "options": ["Triggering re-renders", "Mutable values without re-render", "Routing", "Styling"], "correct": 1},
        {"id": 8, "question": "React.memo performs:", "options": ["Deep comparison", "Shallow props comparison", "No comparison", "Context comparison"], "correct": 1},
        {"id": 9, "question": "Context API helps avoid:", "options": ["Hooks", "Prop drilling", "Reducers", "CSS conflicts"], "correct": 1},
        {"id": 10, "question": "Suspense shows fallback while:", "options": ["Running tests", "Lazy components load", "Updating state", "Mounting refs"], "correct": 1},
        {"id": 11, "question": "Which hook is sync with layout?", "options": ["useEffect", "useLayoutEffect", "useState", "useMemo"], "correct": 1},
        {"id": 12, "question": "Portals render children into:", "options": ["Same DOM tree", "Different DOM node outside hierarchy", "Server only", "Shadow DOM"], "correct": 1},
        {"id": 13, "question": "Error boundaries catch errors in:", "options": ["Event handlers", "Render lifecycle of descendants", "Async code", "setTimeout"], "correct": 1},
        {"id": 14, "question": "Lazy load a component by:", "options": ["import Comp", "React.lazy(() => import('./Comp'))", "useMemo(Comp)", "setTimeout import"], "correct": 1},
        {"id": 15, "question": "Which hook reads URL params in React Router v6?", "options": ["useRouteMatch", "useParams", "useMatchParams", "useHistory"], "correct": 1},
        {"id": 16, "question": "Which attribute replaces 'class' in JSX?", "options": ["classList", "className", "cls", "classAttr"], "correct": 1},
        {"id": 17, "question": "How to stop event bubbling?", "options": ["event.stopPropagation()", "return false", "event.cancel()", "event.halt()"], "correct": 0},
        {"id": 18, "question": "What is hydration?", "options": ["Watermarking HTML", "Attaching events to SSR markup", "Inline CSS", "Bundling"], "correct": 1},
        {"id": 19, "question": "useTransition marks updates as:", "options": ["Urgent", "Non-urgent", "Synchronous", "Blocking"], "correct": 1},
        {"id": 20, "question": "useDeferredValue helps by:", "options": ["Deferring non-urgent renders", "Caching CSS", "Routing", "Queuing events"], "correct": 0},
        {"id": 21, "question": "useId provides:", "options": ["Random numbers", "Stable unique IDs for accessibility", "Refs", "Routing IDs"], "correct": 1},
        {"id": 22, "question": "Which file typically mounts React app?", "options": ["App.jsx", "main.jsx", "router.jsx", "index.css"], "correct": 1},
        {"id": 23, "question": "A controlled input gets value from:", "options": ["DOM default", "React state", "Props only", "Ref only"], "correct": 1},
        {"id": 24, "question": "What triggers re-render in React?", "options": ["console.log", "State/prop changes", "CSS change", "File rename"], "correct": 1},
        {"id": 25, "question": "Best practice keys for mapped items:", "options": ["Array index for sortable lists", "Stable unique id", "Random on each render", "Timestamp"], "correct": 1},
        {"id": 26, "question": "Which hook to manage complex state transitions?", "options": ["useReducer", "useRef", "useMemo", "useLayoutEffect"], "correct": 0},
        {"id": 27, "question": "React Fragment shorthand is:", "options": ["<Frag>", "<F>", "<></>", "<fragment>"], "correct": 2},
        {"id": 28, "question": "Default export to create root in React 18?", "options": ["ReactDOM.render", "ReactDOM.createRoot", "ReactDOM.mount", "ReactDOM.attach"], "correct": 1},
        {"id": 29, "question": "How to memoize expensive list rendering?", "options": ["useMemo", "useRef", "useEffect", "useLayoutEffect"], "correct": 0},
        {"id": 30, "question": "Which hook subscribes to external store reliably?", "options": ["useStore", "useSyncExternalStore", "useSubscribe", "useExternal"], "correct": 1},
        {"id": 31, "question": "What does StrictMode do in development?", "options": ["Optimizes bundles", "Runs extra checks and double-invokes some lifecycles", "Disables warnings", "Skips effects"], "correct": 1},
        {"id": 32, "question": "How to memoize a component to avoid re-render on same props?", "options": ["useMemo(Component)", "React.memo(Component)", "useCallback(Component)", "memoize(Component)"], "correct": 1},
        {"id": 33, "question": "What does useImperativeHandle customize?", "options": ["Props", "Ref value exposed to parents", "State", "Context"], "correct": 1},
        {"id": 34, "question": "Which hook to read search params in React Router v6.4+?", "options": ["useSearchParams", "useQuery", "useParams", "useHash"], "correct": 0},
        {"id": 35, "question": "How to lazy load routes in React Router v6?", "options": ["lazy() + createBrowserRouter", "Switch + loadable", "Suspense only", "Redirect"], "correct": 0},
        {"id": 36, "question": "What prop enables fragments with key?", "options": ["key on <></>", "Use <React.Fragment key='k'>", "Cannot key fragments", "data-key"], "correct": 1},
        {"id": 37, "question": "What API batches state updates in React 18 by default?", "options": ["unstable_batchedUpdates", "Automatic batching", "flushSync", "setImmediate"], "correct": 1},
        {"id": 38, "question": "What is recommended way to focus an input?", "options": ["document.querySelector", "useRef + ref.current.focus()", "window.focus()", "querySelectorAll"], "correct": 1},
        {"id": 39, "question": "Which hook is best for debounced input filtering?", "options": ["useEffect + setTimeout", "useRef only", "useTransition only", "useLayoutEffect only"], "correct": 0},
        {"id": 40, "question": "What does flushSync do?", "options": ["Defers updates", "Forces sync render before browser paint", "Cancels updates", "Hydrates server HTML"], "correct": 1},
        {"id": 41, "question": "How to share logic without rendering UI?", "options": ["Render props", "Custom hooks", "CSS Modules", "Portals"], "correct": 1},
        {"id": 42, "question": "What hook to read current location in Router v6?", "options": ["useHistory", "useLocation", "useRouter", "useRoute"], "correct": 1},
        {"id": 43, "question": "Which component wraps suspenseful routes in Router v6?", "options": ["Await", "Suspense", "RouteGuard", "Switch"], "correct": 1},
        {"id": 44, "question": "What is tree shaking aided by in React builds?", "options": ["CommonJS", "ES modules", "Global vars", "Inline scripts"], "correct": 1},
        {"id": 45, "question": "Best practice for list keys when using UUID per render?", "options": ["Good", "Avoid—causes remount", "Required", "Doesn't matter"], "correct": 1},
        {"id": 46, "question": "How to run effect only once on mount?", "options": ["No deps array", "Empty deps array", "[state]", "return inside effect"], "correct": 1},
        {"id": 47, "question": "What hook to read media query matches?", "options": ["useMediaQuery custom hook", "useRef", "useParams", "useLocation"], "correct": 0},
        {"id": 48, "question": "What does useCallback memoize?", "options": ["Values", "Functions", "Components", "Refs"], "correct": 1},
        {"id": 49, "question": "Which hook to sync state with localStorage?", "options": ["useLocalStorage custom hook", "useSyncExternalStore", "useEffect only", "useRef"], "correct": 0},
        {"id": 50, "question": "How to prevent component from rendering until data is ready?", "options": ["Return null until ready", "Force render", "Use document.write", "Only class components"], "correct": 0},
    ]

    # Ensure at least 50 questions; pad if needed
    target = 50
    if len(questions_pool) < target:
        base = questions_pool.copy()
        while len(questions_pool) < target:
            clone = base[len(questions_pool) % len(base)].copy()
            clone["id"] = len(questions_pool) + 1
            questions_pool.append(clone)

    selected = random.sample(questions_pool, target)
    for idx, q in enumerate(selected):
        q["id"] = idx + 1

    return Response({
        "success": True,
        "data": selected
    })
