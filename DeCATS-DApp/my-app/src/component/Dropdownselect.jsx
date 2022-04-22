
import icon_usdm from '../asset/icon_usdm.svg'
import icon_btcm from '../asset/icon_btcm.svg'
// import icon_ethm from '../asset/icon_ethm.svg'
import Select, { components } from "react-select";

const options = [
  { value: "USDM", label: "USDM", icon: icon_usdm },
  { value: "BTCM", label: "BTCM", icon: icon_btcm }
];

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    color: state.isSelected ? 'white' : 'black',
    width: '100%',
    height:'100%',
    display: 'flex',
    justifyContent: 'space-around',
    alignItem: 'center',
    // color: 'black'
  }),
  valueContainer: (provided, state) => ({
    ...provided,
    // color: state.isSelected ? 'red' : 'blue',
    // padding: 20,
    width: '100%',
    height:'100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItem: 'center',
    color: 'black'
  }),
  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = 'opacity 300ms';
    return { ...provided, opacity, transition };
  }
}

const { Option } = components;
const IconOption = props => (
  <Option {...props}>
    <div>
    <img
      src={props.data.icon}
      style={{ width: 25 }}
      alt={props.data.label}
    />
    </div>
    <div>
    {props.data.label}
    </div>
  </Option>
);

const CustomSelectValue = props => (
  <>
    <div>
    <img
      src={props.data.icon}
      style={{ width: 25 }}
      alt={props.data.label}
    />
    </div>
    <div style={{flexDirection:"flex-end"}}>
    {props.data.label}
    </div>
  </>
)

const Dropdownselect = () => {

  return (
    <Select
      styles={customStyles}
      defaultValue={options[0]}
      options={options}
      components={{ Option: IconOption, SingleValue: CustomSelectValue }}
    />
  );

}

export default Dropdownselect