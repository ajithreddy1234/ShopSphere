CREATE TABLE shopsphere_workspaces (
 id uuid PRIMARY KEY,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE shopsphere_products (
 id uuid PRIMARY KEY,
 workspace_id uuid NOT NULL REFERENCES shopsphere_workspaces(id) ON DELETE CASCADE,
 name text NOT NULL CHECK (length(name) BETWEEN 2 AND 100),
 price numeric(12,2) NOT NULL CHECK (price > 0 AND price <= 10000000),
 image text NOT NULL,
 version integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX shopsphere_products_workspace ON shopsphere_products(workspace_id, created_at);
