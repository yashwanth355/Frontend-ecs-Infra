import React from 'react';
import { Grid } from '@material-ui/core';
import { Select } from "./Select"; 
import { TextField } from './TextField';
import { InputLabel } from './InputLabel';
import Button from './Button';
import { Radio } from './Radio';
import { CheckBox } from './CheckBox';
import {DatePicker} from './DatePicker';
import {ComboBox} from './Autocomplete';
const Template = (props) => {
    const { payload } = props;
    const selectComponent = (v, i) => {
        switch(v.type) {
            case 'input': 
                return <TextField
                    key={i}
                    {...v}
                />       
            case 'button': 
                return <Button
                    key={i}
                    {...v}
                />
            case 'number': 
                return <TextField
                    key={i}
                    {...v}
                    type="number"
                />
            case 'float': 
                return <TextField
                    key={i}
                    {...v}     
                    type="number"                                                                 
                />
            case 'file': 
                return <TextField
                    key={i}
                    {...v}     
                    type="file"                                                                 
                />
            case 'label': 
                return <InputLabel
                    key={i}
                    {...v}
                >{v.value}</InputLabel>
            case 'select':
                return <Select
                    key={i}
                    {...v}
                />
            case 'radio':
                return <Radio 
                    key={i}
                    {...v}
                />
            case 'checkbox':
                return <CheckBox 
                    key={i}
                    {...v}
                />
            case 'datePicker':
                    return <DatePicker
                    key={i}
                    {...v}
                    />           
            case 'autocomplete':
                    return <ComboBox
                    key={i}
                    {...v}
                    />
            default: return null
        }

    }
    //eslint-disable-next-line
    return (
        <Grid id="top-row" container spacing={24} direction="row">
        {
            payload.map((v, i) => (
                    <Grid item xs={v.xs || 12} sm={v.sm || 6}>
                        { selectComponent(v, i) }
                    </Grid>
            ))
        }
        </Grid>
    )
}

export default Template;