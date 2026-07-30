"use client";

interface Tab<T extends string> {
  key: T;
  label: string;
  icon?: React.ReactNode;
}

interface TabBarProps<T extends string> {
  tabs: Tab<T>[];
  active: T;
  onChange: (key: T) => void;
}

export function TabBar<T extends string>({ tabs, active, onChange }: TabBarProps<T>) {
  return (
    <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#212946", border: "1px solid #29314f" }}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
          style={
            active === tab.key
              ? {
                  background: "rgba(33,150,243,0.15)",
                  color: "#90caf9",
                  border: "1px solid rgba(33,150,243,0.25)",
                }
              : { color: "#8492c4", border: "1px solid transparent" }
          }
          onMouseEnter={(e) => {
            if (active !== tab.key)
              (e.currentTarget as HTMLButtonElement).style.color = "#bdc8f0";
          }}
          onMouseLeave={(e) => {
            if (active !== tab.key)
              (e.currentTarget as HTMLButtonElement).style.color = "#8492c4";
          }}
        >
          {tab.icon && <span className="[&>svg]:w-3.5 [&>svg]:h-3.5">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
