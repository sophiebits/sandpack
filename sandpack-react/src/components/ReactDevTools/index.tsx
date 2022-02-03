import { useClasser } from "@code-hike/classer";
import * as React from "react";

import { useSandpackTheme } from "../..";
import { useSandpack } from "../../hooks/useSandpack";
import { css, THEME_PREFIX } from "../../styles";
import { classNames } from "../../utils/classNames";
import { isDarkColor } from "../../utils/stringUtils";

const devToolClassName = css({
  height: "$layout$height",
  width: "100%",
});
type DevToolsTheme = "dark" | "light";

export const SandpackReactDevTools = ({
  clientId,
  theme,
  ...props
}: {
  clientId?: string;
  theme?: DevToolsTheme;
} & React.HtmlHTMLAttributes<unknown>): JSX.Element | null => {
  const { listen, sandpack } = useSandpack();
  const { theme: sandpackTheme } = useSandpackTheme();
  const c = useClasser(THEME_PREFIX);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reactDevtools = React.useRef<any>();

  const [ReactDevTools, setDevTools] = React.useState<React.FunctionComponent<{
    browserTheme: DevToolsTheme;
  }> | null>(null);

  React.useEffect(() => {
    import("react-devtools-inline/frontend").then((module) => {
      reactDevtools.current = module;
    });
  }, []);

  React.useEffect(() => {
    const unsubscribe = listen((msg) => {
      if (msg.type === "activate-react-devtools") {
        const client = clientId
          ? sandpack.clients[clientId]
          : Object.values(sandpack.clients)[0];
        const contentWindow = client?.iframe?.contentWindow;

        if (reactDevtools.current && contentWindow) {
          setDevTools(reactDevtools.current.initialize(contentWindow));
        }
      }
    });

    return unsubscribe;
  }, [reactDevtools, clientId, listen, sandpack.clients]);

  React.useEffect(() => {
    sandpack.registerReactDevTools("legacy");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ReactDevTools) return null;

  const getBrowserTheme = (): DevToolsTheme => {
    if (theme) return theme;

    const isDarkTheme = isDarkColor(sandpackTheme.colors.surface1);

    return isDarkTheme ? "dark" : "light";
  };

  return (
    <div className={classNames(c("devtools"), devToolClassName)} {...props}>
      <ReactDevTools browserTheme={getBrowserTheme()} />
    </div>
  );
};
