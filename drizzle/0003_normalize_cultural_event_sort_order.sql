WITH ordered AS (
  SELECT id, row_number() OVER (
    PARTITION BY month_order
    ORDER BY sort_order ASC, created_at ASC, id ASC
  ) - 1 AS normalized_sort_order
  FROM cultural_events
)
UPDATE cultural_events
SET sort_order = ordered.normalized_sort_order
FROM ordered
WHERE cultural_events.id = ordered.id
  AND cultural_events.sort_order IS DISTINCT FROM ordered.normalized_sort_order;
