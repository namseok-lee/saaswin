import { Chip } from '@mui/material';

interface titleProps {
    title?: string;
}
const TitleBox = ({ title }: titleProps) => {
    const label = title;

    return (
        <Chip
            label={label}
            sx={{
                backgroundColor: 'primary.200',
                borderRadius: 0,
                fontWeight: 'bold',
                fontSize: '24px',
                marginTop: '10px',
                marginBottom: '10px',
                paddingLeft: '50px',
                paddingRight: '50px',
            }}
        />
    );
};
export default TitleBox;
