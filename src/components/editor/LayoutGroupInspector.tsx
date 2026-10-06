import { GroupNode } from '@/lib/page-engine/schemas';

type GroupControl = {
  key: Exclude<keyof GroupNode, 'id' | 'name' | 'children'>;
  label: string;
  options: { label: string; value: string }[];
  customValue?: { key: keyof GroupNode; label: string; min: number; max: number };
};

const GROUP_CONTROLS: GroupControl[] = [
  { key: 'direction', label: 'Direction', options: [{ label: 'Row', value: 'row' }, { label: 'Column', value: 'column' }] },
  { key: 'horizontalAlign', label: 'Horizontal Alignment', options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }, { label: 'Space Between', value: 'space-between' }] },
  { key: 'verticalAlign', label: 'Vertical Alignment', options: [{ label: 'Top', value: 'top' }, { label: 'Center', value: 'center' }, { label: 'Bottom', value: 'bottom' }] },
  { key: 'width', label: 'Width', options: [{ label: 'Fit', value: 'fit' }, { label: 'Full', value: 'full' }, { label: 'Custom', value: 'custom' }], customValue: { key: 'customWidth', label: 'Width (%)', min: 10, max: 100 } },
  { key: 'gap', label: 'Gap', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }, { label: 'Custom', value: 'custom' }], customValue: { key: 'customGap', label: 'Gap (px)', min: 0, max: 96 } },
  { key: 'padding', label: 'Padding', options: [{ label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' }, { label: 'Custom', value: 'custom' }], customValue: { key: 'customPadding', label: 'Padding (px)', min: 0, max: 128 } },
  { key: 'mobileDirection', label: 'Mobile Direction', options: [{ label: 'Row', value: 'row' }, { label: 'Column', value: 'column' }] },
];

export function LayoutGroupInspector({ group, onChange }: { group: GroupNode; onChange: (group: GroupNode) => void }) {
  const setValue = (key: keyof GroupNode, value: string | number) => onChange({ ...group, [key]: value });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Layout Group</h3>
        <p className="mt-1 text-xs text-slate-500">Arrange components together. Groups stack automatically on small screens.</p>
      </div>
      {GROUP_CONTROLS.map(control => {
        const value = String(group[control.key]);
        const customValue = value === 'custom' ? control.customValue : undefined;
        return (
          <div key={String(control.key)}>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">{control.label}</label>
            <select
              value={value}
              onChange={event => setValue(control.key, event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800/50"
            >
              {control.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            {customValue && (
              <div className="mt-2">
                <label className="mb-1 block text-[11px] text-slate-400">{customValue.label}</label>
                <input
                  type="number"
                  min={customValue.min}
                  max={customValue.max}
                  value={Number(group[customValue.key])}
                  onChange={event => {
                    const nextValue = Math.max(customValue.min, Math.min(customValue.max, Number(event.target.value)));
                    setValue(customValue.key, nextValue);
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800/50"
                />
              </div>
            )}
          </div>
        );
      })}
      <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Colors</h4>
        <div className="grid grid-cols-2 gap-3">
          <ColorControl label="Background" value={group.backgroundColor} fallback="#ffffff" onChange={value => setValue('backgroundColor', value)} onClear={() => onChange({ ...group, backgroundColor: undefined })} />
          <ColorControl label="Text" value={group.textColor} fallback="#000000" onChange={value => setValue('textColor', value)} onClear={() => onChange({ ...group, textColor: undefined })} />
        </div>
      </div>
    </div>
  );
}

function ColorControl({ label, value, fallback, onChange, onClear }: { label: string; value?: string; fallback: string; onChange: (value: string) => void; onClear: () => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-500">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value || fallback} onChange={event => onChange(event.target.value)} className="h-8 w-8 cursor-pointer rounded border-0 p-0" />
        <button onClick={onClear} className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">Clear</button>
      </div>
    </div>
  );
}
