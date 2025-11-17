import { gql, useQuery } from "@apollo/client";
import { List, ListItem, ListItemText, Typography } from "@material-ui/core";
import {
  Receipt as ReceiptIcon,
  CalendarToday as CalendarTodayIcon,
} from "@material-ui/icons";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";
import { formatDate, parseDate } from "./utils";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    width: "100%",
    maxWidth: "none",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: "8px",
    margin: "12px 0",
    padding: "16px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  icon: {
    marginRight: "20px",
    fontSize: "28px",
  },
  date: {
    color: theme.palette.success.main,
  },
}));

const GET_INVOICES = gql`
  query GetInvoices($parentId: Long!) {
    invoices(parentId: $parentId) {
      id
      amount
      date
    }
  }
`;

const InvoiceItem = ({ amount, date }: { amount: number; date: string }) => {
  const classes = useStyles();
  return (
    <ListItem className={classes.listItem}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <ReceiptIcon className={classes.icon} />
        <ListItemText
          primary={`$${amount}`}
          primaryTypographyProps={{ variant: "h5" }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <CalendarTodayIcon className={classes.icon} />
        <Typography variant="body1" className={classes.date}>
          {formatDate(parseDate(date))}
        </Typography>
      </div>
    </ListItem>
  );
};

const Invoices = ({ parentId }: { parentId: number }) => {
  const { loading, data } = useQuery(GET_INVOICES, { variables: { parentId } });
  const classes = useStyles();

  if (loading) return <p>Loading...</p>;

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div>
          <Typography variant="h5">Invoices</Typography>
          <Typography variant="subtitle1" style={{ color: grey[700] }}>
            Your billing history at a glance
          </Typography>
        </div>
      </div>
      <List>
        {data?.invoices.map((invoice: any) => (
          <InvoiceItem
            key={invoice.id}
            amount={invoice.amount}
            date={invoice.date}
          />
        ))}
      </List>
    </div>
  );
};

export default Invoices;
