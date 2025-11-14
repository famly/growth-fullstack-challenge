
import { makeStyles, Theme } from "@material-ui/core/styles";
const useStyles = makeStyles((theme: Theme) => ({
    alertContainer: {
        display: "flex",
        alignItems: "center", 
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(2),
        backgroundColor: theme.palette.error.light,
        color: theme.palette.error.contrastText,
        marginBottom: theme.spacing(2),
        marginTop: theme.spacing(2),
    }, 
    alertIcon: {
        marginRight: theme.spacing(2),
        alignContent: "center",
    },
}));
const Alert = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles();
  return (
    <div className={classes.alertContainer}>
      <div className={classes.alertIcon}>
        <svg
          className="MuiSvgIcon-root MuiSvgIcon-fontSizeInherit"
          focusable="false"
          aria-hidden="true"
          viewBox="0 0 24 24"
        >
          <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path>
        </svg>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default Alert;
