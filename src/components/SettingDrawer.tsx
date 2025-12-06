"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { ColorPicker, Drawer, Form, Slider, Switch } from 'antd';
import type { Color as AggregationColor } from 'antd/es/color-picker';

import {
    type AllThemeType,
    type BgImgType,
    customColors,
    customTheme,
    type ThemeValuesType,
    useTheme
} from '@/lib/theme-context';

const presetColorList = Array.from(new Set(
    Object.values(customColors).map(({ color }) => color?.toLowerCase())
));

const bgImgByColor = new Map<string, BgImgType>(
    Object.values(customColors).map((c) => [c.color.toLowerCase(), c.bgImg])
);

interface PreBuiltThemeType {
    label: string;
    key: AllThemeType;
    imgSrc: string;
    value: ThemeValuesType;
}

const themeOptions: PreBuiltThemeType[] = [
    { label: 'System', key: 'system', imgSrc: '/theme-assets/systemSelect.svg', value: customTheme.system },
    { label: 'Light', key: 'light', imgSrc: '/theme-assets/defaultSelect.svg', value: customTheme.light },
    { label: 'Dark', key: 'dark', imgSrc: '/theme-assets/darkSelect.svg', value: customTheme.dark },
    { label: 'Leaf', key: 'greenLeaf', imgSrc: '/theme-assets/leafSelect.svg', value: customTheme.greenLeaf },
    { label: 'Blossom', key: 'blossom', imgSrc: '/theme-assets/blossomSelect.svg', value: customTheme.blossom },
    { label: 'Blue Jelly', key: 'blueJelly', imgSrc: '/theme-assets/purpleJellySelect.svg', value: customTheme.blueJelly },
];

const presets = [
    { "label": "Preset", "key": "Preset", colors: presetColorList }
];

export default function SettingDrawer() {
    const {
        alpha,
        navStick,
        lightTheme,
        compactMode,
        primaryColor,
        settingsDrawer,
        borderRadius: borderRadiusState,
        togglePreset,
        toggleTheme,
        toggleNavStick,
        setPrimaryColor,
        setBgImg,
        setBorderRadius,
        setCompactMode,
        setAlpha,
        toggleSettingsDrawer,
    } = useTheme();

    const [localRadius, setLocalRadius] = useState(borderRadiusState);
    const [localAlpha, setLocalAlpha] = useState(alpha);
    const [localColor, setLocalColor] = useState<string>(primaryColor);

    useEffect(() => {
        setLocalRadius(borderRadiusState);
    }, [borderRadiusState]);

    useEffect(() => {
        setLocalAlpha(alpha);
    }, [alpha]);

    useEffect(() => {
        setLocalColor(primaryColor);
    }, [primaryColor]);

    const onClose = () => {
        toggleSettingsDrawer(false);
    };

    const handleNav = (checked: boolean) => {
        toggleNavStick(checked);
    };

    const handleTheme = (checked: boolean) => {
        toggleTheme(!checked);
    };

    const handleCompactMode = (checked: boolean) => {
        setCompactMode(checked);
    };

    const handleColorChange = (newColor: AggregationColor) => {
        setLocalColor('#' + newColor.toHex());
    };

    const onColorChangeComplete = (colorObj: AggregationColor | string) => {
        const newColor = colorObj instanceof Object && 'toHex' in colorObj
            ? '#' + colorObj.toHex()
            : colorObj as string;
        setLocalColor(newColor);
        const newBgImg = bgImgByColor.get(newColor?.toLowerCase()) ?? "";

        setPrimaryColor(newColor);
        setBgImg(newBgImg);
    };

    const handlePreBuiltTheme = (v: PreBuiltThemeType) => {
        toggleTheme(v.value.lightTheme);
        setPrimaryColor(v.value.primary.color);
        setBgImg(v.value.primary.bgImg);
        setBorderRadius(v.value.borderRadius);
        setCompactMode(v.value.compact);
        setAlpha(v.value.alpha);
        togglePreset(v.key);
    };

    return (
        <Drawer
            title="My Theme"
            placement="right"
            size="default"
            onClose={onClose}
            open={settingsDrawer}
            destroyOnClose
            classNames={{ body: `[color-scheme:light] dark:[color-scheme:dark]` }}
        >
            <Form.Item
                layout='vertical'
                label="Theme"
                className='mb-6'
            >
                <div className="grid grid-cols-3 gap-4">
                    {themeOptions.map(option => {
                        const check = customTheme[option.key].lightTheme === lightTheme &&
                            customTheme[option.key].compact === compactMode &&
                            customTheme[option.key].borderRadius === localRadius &&
                            customTheme[option.key].alpha === localAlpha &&
                            customTheme[option.key].primary.color === localColor;
                        const isSelected = typeof window !== 'undefined' && ('theme' in localStorage)
                            ? check && option.key !== "system"
                            : option.key === "system" && check;
                        return (
                            <div
                                key={option.key}
                                className='cursor-pointer flex flex-col justify-center items-center gap-1.5 transition-all hover:opacity-80'
                                onClick={() => handlePreBuiltTheme(option)}
                            >
                                <div
                                    style={{ borderRadius: borderRadiusState }}
                                    className={`overflow-hidden border-2 duration-200 transition-all ${isSelected ? 'border-colorPrimary shadow-md' : 'border-gray-200 dark:border-gray-700'}`}
                                >
                                    <div className="relative" style={{ height: 88, width: 160 }}>
                                        <Image
                                            src={option.imgSrc}
                                            alt={option.label}
                                            fill
                                            style={{ objectFit: 'cover', borderRadius: borderRadiusState - 1 }}
                                        />
                                    </div>
                                </div>
                                <span className='text-sm font-medium'>{option.label}</span>
                            </div>
                        );
                    })}
                </div>
            </Form.Item>

            <Form.Item
                layout='vertical'
                label="Primary Color"
                className='mb-6'
            >
                <div className="flex gap-2 flex-wrap items-center">
                    {presetColorList.map(color => {
                        const selected = localColor?.toLowerCase() === color?.toLowerCase();
                        return (
                            <div key={color}
                                className={`border-2 rounded-full p-1 cursor-pointer transition-all hover:scale-110 ${selected ? 'border-colorPrimary shadow-sm' : 'border-transparent'}`}
                            >
                                <div
                                    onClick={() => onColorChangeComplete(color)}
                                    className='size-7 rounded-full transition-transform active:scale-90'
                                    style={{ backgroundColor: color }}
                                />
                            </div>
                        );
                    })}

                    <ColorPicker
                        presets={presets}
                        value={localColor}
                        onChange={handleColorChange}
                        onChangeComplete={onColorChangeComplete}
                        disabledAlpha
                        placement='top'
                    >
                        <div className={`border-2 rounded-full p-1 cursor-pointer transition-all hover:scale-110 ${!presetColorList.includes(primaryColor.toLowerCase()) ? 'border-colorPrimary shadow-sm' : 'border-transparent'}`}>
                            <Image src="/theme-assets/colorWheel.png" alt="color Wheel" width={28} height={28} className='rounded-full' />
                        </div>
                    </ColorPicker>
                </div>
            </Form.Item>

            <Form.Item
                layout='vertical'
                label="Transparency"
                help="Set to 1 for solid backgrounds; 0.5 is recommended when using background images."
                className='pb-6! mb-6!'
            >
                <Slider
                    onChange={(v) => setLocalAlpha(v)}
                    onChangeComplete={(v) => setAlpha(v)}
                    value={localAlpha}
                    min={0}
                    max={1}
                    step={0.01}
                    tooltip={{ formatter: (value) => `${value}` }}
                />
            </Form.Item>

            <Form.Item
                layout='vertical'
                label="Border Radius"
                className='mb-6'
            >
                <Slider
                    onChange={(v) => setLocalRadius(v)}
                    onChangeComplete={(v) => setBorderRadius(v)}
                    value={localRadius}
                    min={0}
                    max={20}
                />
            </Form.Item>

            <div className='flex flex-wrap items-start justify-between gap-6'>
                <Form.Item
                    layout='vertical'
                    label="Dark Theme"
                    valuePropName="checked"
                    className='mb-0'
                >
                    <Switch
                        onChange={handleTheme}
                        checked={!lightTheme}
                    />
                </Form.Item>

                <Form.Item
                    layout='vertical'
                    label="Pin Navbar"
                    valuePropName="checked"
                    className='mb-0'
                >
                    <Switch
                        onChange={handleNav}
                        checked={navStick}
                    />
                </Form.Item>

                <Form.Item
                    layout='vertical'
                    label="Compact Mode"
                    valuePropName="checked"
                    className='mb-0'
                >
                    <Switch
                        onChange={handleCompactMode}
                        checked={compactMode}
                    />
                </Form.Item>
            </div>
        </Drawer>
    );
}
