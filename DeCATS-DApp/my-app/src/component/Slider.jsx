import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import style from "../page/TradeQuote/TradeQuote.module.scss";
import {useEffect, useState} from "react";

const SliderOutput = ({selectedSize, sliderValueOnChange}) => {
  // const MySlider = Slider.createSliderWithTooltip(Slider);
  // const inverseCurve = Math.log;
  // const sliderCurve = Math.exp;
  // const maxValue = inverseCurve(1000000)
  // const minValue = inverseCurve(1)
  const maxValue = 100;
  const minValue = 0;
  const [defaultValue, setDefaultValue] = useState(selectedSize ? selectedSize : 0);

  function _sliderValueOnChange(value) {
    sliderValueOnChange(value);
  }

  function prettyInt(x) {
    return Math.round(x)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  useEffect(() => {
    let isUnmount = false;
    if (selectedSize) {
      const _defaultValue = (maxValue * selectedSize) / 100;
      setDefaultValue(_defaultValue);
    } else {
      setDefaultValue(0);
    }
    return () => (isUnmount = true);
  }, [selectedSize]);

  return (
    <Slider
      min={minValue}
      max={maxValue}
      // marks={
      //     {
      //         [inverseCurve(10000)]: {
      //             style: { color: "#61bcf4" },
      //             label: <strong>{prettyInt(10000)}</strong>
      //         },
      //         [inverseCurve(40000)]: {
      //             style: { color: "#468ea4" },
      //             label: <strong>{prettyInt(40000)}</strong>
      //         }
      //     }

      // }
      step={(maxValue - minValue) / 100} // 100 steps in range
      // tipFormatter={value => prettyInt(sliderCurve(value))}
      onChange={_sliderValueOnChange}
      handleStyle={{
        height: 16,
        width: 16,
        borderRadius: "50%",
        background: "#52B4D0",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
        border: "none",
      }}
      dotStyle={{
        height: 10,
        width: 10,
        top: 0,
        borderRadius: "50%",
        background: "#52B4D0",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
        border: "none",
      }}
      railStyle={{background: "#235564", height: 8}}
      trackStyle={{
        transition: "0.3s ease background-color",
        height: 8,
        background: "#235564",
      }}
      value={defaultValue}
      defaultValue={defaultValue}
      // startPoint={inverseCurve(500000)}
    />
  );
};

export default SliderOutput;
