export default function SideBarButtonBar(props) {
    return (
        <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-b-md bg-slate-100  leading-5 text-slate-700 border border-slate-300 shadow">
            {props.children}
      </div>
    );
}