BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Candidates] (
    [id] INT NOT NULL IDENTITY(1,1),
    [fullName] NVARCHAR(200) NOT NULL,
    [email] NVARCHAR(255) NOT NULL,
    [phone] NVARCHAR(30),
    [area] NVARCHAR(150),
    [summary] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Candidates_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Candidates_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Candidates_email_key] UNIQUE NONCLUSTERED ([email])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
