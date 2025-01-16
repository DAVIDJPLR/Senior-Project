import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

interface Props{
    setSearchVal: (val: string) => void;
    handleKeyUp: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    size: 'small' | 'medium';
}

function SearchBar({setSearchVal, handleKeyUp, size}: Props){
    return(
        <TextField label="Search" variant="outlined" size={size} sx={{width: "90%", "& .MuiOutlinedInput-root": {borderRadius: 8}}} 
        onChange={(e) => setSearchVal(e.target.value)}
        onKeyUp={handleKeyUp}
        slotProps={{
            input: {
                startAdornment: 
                    <InputAdornment position="start">
                        <SearchIcon></SearchIcon>
                    </InputAdornment>
            }
        }}></TextField>
    );
}

export default SearchBar;