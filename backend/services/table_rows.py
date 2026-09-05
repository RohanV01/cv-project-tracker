"""XML-level row count adjustment for a python-pptx Table (deletion is safe/native;
insertion is a simple deep-copy of the last data row, no relationships involved)."""
import copy

from pptx.oxml.ns import qn


def set_data_row_count(table, n: int) -> None:
    tbl = table._tbl
    rows = tbl.findall(qn("a:tr"))
    data_rows = rows[1:]  # rows[0] is the header
    current = len(data_rows)

    if n > current:
        if not data_rows:
            raise ValueError("table has no data row to use as a clone template")
        template = data_rows[-1]
        for _ in range(n - current):
            tbl.append(copy.deepcopy(template))
    elif n < current:
        for row_el in data_rows[n:]:
            tbl.remove(row_el)
