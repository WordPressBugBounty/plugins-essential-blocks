import { __ } from '@wordpress/i18n'
import {
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components'
import { memo } from '@wordpress/element'
import { useBlockSetAttributes } from '../../hooks'

export const ButtonGroupControl = memo(({
    label = '',
    options,
    currentValue,
    attrName,
    onChange
}) => {
    const setAttributes = useBlockSetAttributes();
    return <ToggleGroupControl
        label={label}

        value={currentValue}
        onChange={(value) => {
            if (onChange) {
                onChange(value);
            } else {
                setAttributes({
                    [attrName]: value,
                })
            }
        }}
        isBlock
        __next40pxDefaultSize
        __nextHasNoMarginBottom
    >
        {options.map((option, index) => (
            <ToggleGroupControlOption
                key={index}
                value={option.value}
                label={option.label}
            />
        ))}
    </ToggleGroupControl>
})
